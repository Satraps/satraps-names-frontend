<template>
  <div class="container text-center">
    <div class="text-align-header">
      <h1 class="inter">Your <span class="animated-text px-2">
        {{domain.name}}
      </span> needs an ID!</h1>
      <p class="header-desc fw-bold">Smaller/descriptive text to be <br> included here later</p>
    </div>

    <div class="d-flex justify-content-center domain-input-container mb-3 mt-5">
      <div class="input-group domain-input input-group-lg input-sizing">

        <input
          v-model="chosenDomainName" 
          placeholder="Enter your desired ID"
          type="text" 
          class="form-control"
          aria-label="Text input with dropdown button"
        >

        <span class="input-group-text tld-addon">
          <span v-if="loading" class="spinner-border spinner-border-sm mx-1" role="status" aria-hidden="true"></span>
          <span>{{getTldName}}</span>
        </span>
      </div>
    </div>

    <p class="error">
      <small v-if="buyNotValid(chosenDomainName).invalid">
        <em>{{ buyNotValid(chosenDomainName).message }}</em>
      </small>
    </p>


    <!-- Minter contract paused -->
    <button v-if="isActivated && getMinterPaused" class="btn btn-primary btn-lg mt-3 buy-button" :disabled="true">
      <span v-if="getMinterPaused">Claiming is paused</span>
    </button>

    <!-- Not eligible -->
    <button 
      v-if="isActivated && isNetworkSupported && !getMinterPaused && !getCanUserBuy" 
      class="btn btn-primary btn-lg mt-3 buy-button" 
      :disabled="waiting || buyNotValid(chosenDomainName).invalid || !hasUserEnoughTokens"
    >
      <span>You need to own a Satrap NFT</span>
    </button>

    <!-- Too low ETH balance -->
    <button 
      v-if="isActivated && isNetworkSupported && !getMinterPaused && !hasUserEnoughTokens && getCanUserBuy" 
      class="btn btn-primary btn-lg mt-3 buy-button" 
      :disabled="waiting || buyNotValid(chosenDomainName).invalid || !hasUserEnoughTokens"
    >
      <span>Your {{getPaymentTokenName}} balance is too low</span>
    </button>

    <!-- Buy domain -->
    <button 
      v-if="isActivated && isNetworkSupported && getCanUserBuy && !getMinterPaused && hasUserEnoughTokens" 
      class="btn btn-primary btn-lg mt-3 buy-button" 
      @click="buyDomain" 
      :disabled="waiting || buyNotValid(chosenDomainName).invalid || !hasUserEnoughTokens"
    >
      <span v-if="waiting" class="spinner-border spinner-border-sm mx-1" role="status" aria-hidden="true"></span>
      <span>CLAIM ID</span>
    </button>

    <!-- Discount -->
    <div class="discount inter"> 
      <div class="discount-line"></div>
      <div class="row">
        <p class="col-6">Price</p>
        <p class="col-6">Partner Discount</p>
      </div>
      <div class="row">
        <p class="col-6">
          {{Math.floor(getPrice)}} {{getPaymentTokenName}}
        </p>
        <p class="discount-text col-6" v-if="domain.address == address && address != ''">CYBRs - 60% OFF</p>
      </div>
       <!-- Connect Wallet -->
      <button v-if="!isActivated" class="btn connect-wallet px-5 btn-lg mt-3 btn-Disconnected" @click="open">Mint ID</button>
     </div>

    <div v-if="isActivated && !isNetworkSupported" class="mt-4">
      <button class="btn btn-primary btn-lg btn-Disconnected" @click="changeNetwork(this.getTldChainName)">Switch to {{getTldChainName}}</button>
    </div>

   <!--  <div class="text-align-header mt-5">
      <h3>BE A PART OF HISTORY AND CLAIM YOUR ON-CHAIN ID</h3>
    </div> -->

    <!-- <div class="row mt-5">
      <div class="col-md-6 offset-md-3 table-container">
        <table class="table table-borderless table-ppl">
          <thead class="table-light">
            <tr>
              <th scope="col">ID length</th>
              <th scope="col">Price</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1 character</td>
              <td>{{Math.floor(getMinterTldPrice1 * this.getDiscountFactor)}} {{getPaymentTokenName}}</td>
            </tr>
            <tr>
              <td>2 characters</td>
              <td>{{Math.floor(getMinterTldPrice2 * this.getDiscountFactor)}} {{getPaymentTokenName}}</td>
            </tr>
            <tr>
              <td>3 characters</td>
              <td>{{Math.floor(getMinterTldPrice3 * this.getDiscountFactor)}} {{getPaymentTokenName}}</td>
            </tr>
            <tr>
              <td>4 characters</td>
              <td>{{Math.floor(getMinterTldPrice4 * this.getDiscountFactor)}} {{getPaymentTokenName}}</td>
            </tr>
            <tr>
              <td>5+ characters</td>
              <td>{{Math.floor(getMinterTldPrice5 * this.getDiscountFactor)}} {{getPaymentTokenName}}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div> -->
    
  </div>

</template>

<script>
import { ethers } from 'ethers';
import { useBoard, useEthers } from 'vue-dapp';
import { mapActions, mapGetters, mapMutations } from 'vuex';
import { useToast, TYPE } from "vue-toastification";
import WaitingToast from "../components/toasts/WaitingToast.vue";
import Referral from '../components/Referral.vue';
import useDomainHelpers from "../hooks/useDomainHelpers";
import useChainHelpers from "../hooks/useChainHelpers";
import MinterAbi from "../abi/Minter.json";

export default {
  name: "BuyDomain",

  data() {
    return {
      chosenDomainName: null,
      chosenAllowance: null,
      loading: false, // loading data
      waiting: false, // waiting for TX to complete
      minterContract: null,
      domain: 'CYBR',
      interval: null,
      domains: [
        {name: 'CYBR', address: '0x34FF649D709ccCEc77bCf433317176fD13246296'},
        {name: 'SATRAP', address: ''},
        {name: 'SPARKTAN', address: ''},
        {name: 'SENATOR', address: ''},
        {name: 'CITIZEN', address: ''}

      ]
    }
  },

  components: {
    Referral
  },

  mounted() {
    this.interval = setInterval(() => {
    let index = this.domains.indexOf(this.domain)
    let nextIndex = index == 4 ? 0 : index + 1;
      this.domain = this.domains[nextIndex]
    }, 1000);
  },

  beforeUnmount() {
    clearInterval(this.interval)
  },

  computed: {
    ...mapGetters("user", ["getPaymentTokenAddress", "getPaymentTokenName", "getPaymentTokenAllowance", "getUserBalance", "getCanUserBuy", "getDiscountEligible"]),
    ...mapGetters("network", ["getBlockExplorerBaseUrl"]),
    ...mapGetters("tld", ["getTldChainId", "getTldChainName", "getMinterAddress", "getTldContract", "getMinterTldPrice1", "getMinterTldPrice2", "getMinterTldPrice3", "getMinterTldPrice4", "getMinterTldPrice5", "getMinterPaused", "getMinterDiscountPercentage", "getTldName"]),

    getDiscountFactor() {
      let factor = 1;

      if (this.getDiscountEligible && this.getMinterDiscountPercentage > 0) {
        factor -= (this.getMinterDiscountPercentage/100);
      }

      return factor;
    },

    getPrice() {
      if (this.chosenDomainName) {
        if (this.chosenDomainName.match(/./gu).length === 1) {
          return this.getMinterTldPrice1 * this.getDiscountFactor;
        } else if (this.chosenDomainName.match(/./gu).length === 2) {
          return this.getMinterTldPrice2 * this.getDiscountFactor;
        } else if (this.chosenDomainName.match(/./gu).length === 3) {
          return this.getMinterTldPrice3 * this.getDiscountFactor;
        } else if (this.chosenDomainName.match(/./gu).length === 4) {
          return this.getMinterTldPrice4 * this.getDiscountFactor;
        }
      }
      
      return this.getMinterTldPrice5 * this.getDiscountFactor;
    },

    domainLowerCase() {
      return this.chosenDomainName.toLowerCase();
    },

    hasUserEnoughTokens() {
      if (this.address && Number(this.getUserBalance) > 0) {
        if (Number(this.getUserBalance) >= Number(this.getPrice)) {
          return true;
        }
      }

      return false;
    },

    isNetworkSupported() {
      if (this.isActivated) {
        if (this.chainId === this.getTldChainId) {
          return true;
        }
      }

      return false;
    }
  },

  methods: {
    ...mapActions("user", ["fetchCanUserBuy", "getPaymentTokenDecimals"]),
    ...mapMutations("user", ["addDomainManually", "setPaymentTokenAllowance"]),

    async buyDomain() {
      this.waiting = true;
      const fullDomainName = this.domainLowerCase + this.getTldName;

      // check if domain already minted
      const existingHolder = await this.getTldContract.getDomainHolder(this.domainLowerCase);

      if (existingHolder !== ethers.constants.AddressZero) {
        this.toast("Sorry, but this ID is already taken...", {type: TYPE.ERROR});
        this.waiting = false;
        return;
      }

      // wrapper contract (with signer)
      const wrapperIntfc = new ethers.utils.Interface(MinterAbi);
      const minterContractSigner = new ethers.Contract(this.getMinterAddress, wrapperIntfc, this.signer);

      try {
        let referral = localStorage.getItem("referral");

        if (!referral || !ethers.utils.isAddress(referral)) {
          referral = ethers.constants.AddressZero;
        }

        const tx = await minterContractSigner.mint(
          this.domainLowerCase,
          this.address,
          referral,
          {
            value: ethers.utils.parseEther(this.getPrice)
          }
        );

        const toastWait = this.toast(
          {
            component: WaitingToast,
            props: {
              text: "Please wait for your transaction to confirm. Click on this notification to see transaction in the block explorer."
            }
          },
          {
            type: TYPE.INFO,
            onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          }
        );

        const receipt = await tx.wait();

        if (receipt.status === 1) {
          this.toast.dismiss(toastWait);
          this.toast("You have successfully claimed your ID!", {
            type: TYPE.SUCCESS,
            onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });
          this.addDomainManually(fullDomainName);
          this.waiting = false;
        } else {
          this.toast.dismiss(toastWait);
          this.toast("Transaction has failed.", {
            type: TYPE.ERROR,
            onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });
          console.log(receipt);
          this.waiting = false;
        }

      } catch (e) {
        console.log(e)
        this.waiting = false;
        this.toast(e.message, {type: TYPE.ERROR});
      }

      this.waiting = false;
    },

    changeNetwork(networkName) {
      const networkData = this.switchNetwork(networkName); 

      window.ethereum.request({ 
        method: networkData.method, 
        params: networkData.params
      });
    },

  },

  setup() {
    const { open } = useBoard();
    const { address, chainId, isActivated, signer } = useEthers();
    const toast = useToast();
    const { buyNotValid } = useDomainHelpers();
    const { switchNetwork } = useChainHelpers();

    return { address, buyNotValid, chainId, isActivated, open, signer, switchNetwork, toast }
  }
}
</script>


<style scoped>
.and {
  font-size: 1.7em;
  vertical-align: bottom;
  padding-left: 0.2em;
  padding-right: 0.1em;
}

.buy-button {
  margin-bottom: 20px;
  background-color: #cc3333 !important;
}

.container {
  padding-top: 80px;
  padding-bottom: 50px;
}

.domain-input {
  width: 50%;
}

.domain-input > input {
  color: #00000066;
  border-right: 1px solid #000000;
  border-radius: 27px;
  background: rgba(217, 217, 217, 0.8);
}

.domain-input > input::placeholder {
  color: #0D0F1A;
  opacity: 0.7;
}

.domain-input-container {
  margin-top: 30px;
}

.error {
  color: #DBDFEA;
}

.main-img {
  width: 8em;
  border: #ffffff solid 3px;
}

th:first-of-type {
  border-top-left-radius: 10px;
  border-collapse: separate;
}
th:last-of-type {
  border-top-right-radius: 10px;
}
tr:last-of-type td:first-of-type {
  border-bottom-left-radius: 10px;
}
tr:last-of-type td:last-of-type {
  border-bottom-right-radius: 10px;
}

.table-light {
  color: #0D0F1A;
}

.table-ppl {
  background-color: #231e47;
  opacity: 0.6;
  border: 2px solid white;
  border-radius: 10px !important;
  border-collapse: separate;
  color: white;
}

.tld-addon {
  background-color: rgba(217, 217, 217, 0.8);
  color:#0D0F1A;
  border-bottom-right-radius: 27px !important;
  border-top-right-radius: 27px !important;
}

@media only screen and (max-width: 767px) {
  .domain-input {
    width: 100%;
  }

  .discount {
    width: 90% !important;
    height: auto !important;
  }
}

.header-desc {
  font-family: 'American Captain';
  font-size: 45px;
  line-height: 48px;
}

.inter {
  font-family: 'Inter';
}

.animated-text {
  font-weight: 700;
  color: #E83064;
}

.connect-wallet, .connect-wallet:hover  {
  background: #CC3333;
  border-radius: 23px;
  color: white;
}

.discount-text {
  background: rgba(5, 255, 0, 0.65);
  border-radius: 16px;
}

.discount-line {
  border: 1px solid #FFFFFF;
}

.discount {
  background: rgba(217, 217, 217, 0.3);
  border: 1px solid #000000;
  border-radius: 19px;
  padding: 20px;
  width: 381px;
  height: 200px;
  display: flex;
  margin: auto;
  flex-direction: column;
}
</style>
