<template>
  <div class="container text-center">
    <img class="img-fluid main-img rounded" src="../assets/satrap.jpg" />
    
    <div class="slde">
      <div class="slde__container">
        <p class="slde__container__text">Hello </p>
        <ul class="slde__container__list">
          <li class="slde__container__list__item">1 !</li>
          <li class="slde__container__list__item">2 !</li>
          <li class="slde__container__list__item">3 !</li>
          <li class="slde__container__list__item">4 !</li>
        </ul>
      </div>
    </div>

    <div class="text-align-header">
        Price: {{Math.floor(getPrice)}} {{getPaymentTokenName}}
    </div>

    <div class="d-flex justify-content-center domain-input-container mb-3 mt-5">
      <div class="input-group domain-input input-group-lg input-sizing">

        <input
          v-model="chosenDomainName" 
          placeholder="Enter your desired ID"
          type="text" 
          class="form-control text-end border-2 border-end-0 border-light"
          aria-label="Text input with dropdown button"
        >

        <span class="input-group-text tld-addon border-2 border-light">
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

    <!-- Connect Wallet -->
    <button v-if="!isActivated" class="btn btn-primary btn-lg mt-3 btn-Disconnected" @click="open">Connect wallet</button>

    <div v-if="isActivated && !isNetworkSupported" class="mt-4">
      <button class="btn btn-primary btn-lg btn-Disconnected" @click="changeNetwork(this.getTldChainName)">Switch to {{getTldChainName}}</button>
    </div>

    <div class="text-align-header mt-5">
      <h3>BE A PART OF HISTORY AND CLAIM YOUR ON-CHAIN ID</h3>
    </div>

    <div class="row mt-5">
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
    </div>
    
  </div>

  <Referral v-if="isActivated" />

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
      minterContract: null
    }
  },

  components: {
    Referral
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
  color: #0D0F1A;
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
  background-color: white;
  color:#0D0F1A;
}

.slde {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  height: 160px;
  overflow:hidden;
  font-family: 'Lato', sans-serif;
  font-size: 35px;
  line-height: 40px;
  color: #ecf0f1;
  
  &__container {
    font-weight: 600;
    overflow: hidden;
    height: 40px;
    padding: 0 40px;

    &:before {
      content: '[';
      left: 0;
    }

    &:after {
      content: ']';
      position: absolute;
      right: 0;
    }

    &:after, &:before {
      position: absolute;
      top: 0;
      
      color: #16a085;
      font-size: 42px;
      line-height: 40px;
      
      -webkit-animation-name: opacity;
      -webkit-animation-duration: 2s;
      -webkit-animation-iteration-count: infinite;
      animation-name: opacity;
      animation-duration: 2s;
      animation-iteration-count: infinite;
    }

    &__text {
      display: inline;
      float: left;
      margin: 0;
    }

    &__list {
      margin-top: 0;
      padding-left: 110px;
      text-align: left;
      list-style: none;
      
      -webkit-animation-name: change;
      -webkit-animation-duration: 10s;
      -webkit-animation-iteration-count: infinite;
      animation-name: change;
      animation-duration: 10s;
      animation-iteration-count: infinite;

      &__item {
        line-height:40px;
        margin:0;
      }
    }
  }
}

@-webkit-keyframes opacity {
  0%, 100% {opacity:0;}
  50% {opacity:1;}
}

@-webkit-keyframes change {
  0%, 12.66%, 100% {transform:translate3d(0,0,0);}
  16.66%, 29.32% {transform:translate3d(0,-25%,0);}
  33.32%,45.98% {transform:translate3d(0,-50%,0);}
  49.98%,62.64% {transform:translate3d(0,-75%,0);}
  66.64%,79.3% {transform:translate3d(0,-50%,0);}
  83.3%,95.96% {transform:translate3d(0,-25%,0);}
}

@-o-keyframes opacity {
  0%, 100% {opacity:0;}
  50% {opacity:1;}
}

@-o-keyframes change {
  0%, 12.66%, 100% {transform:translate3d(0,0,0);}
  16.66%, 29.32% {transform:translate3d(0,-25%,0);}
  33.32%,45.98% {transform:translate3d(0,-50%,0);}
  49.98%,62.64% {transform:translate3d(0,-75%,0);}
  66.64%,79.3% {transform:translate3d(0,-50%,0);}
  83.3%,95.96% {transform:translate3d(0,-25%,0);}
}

@-moz-keyframes opacity {
  0%, 100% {opacity:0;}
  50% {opacity:1;}
}

@-moz-keyframes change {
  0%, 12.66%, 100% {transform:translate3d(0,0,0);}
  16.66%, 29.32% {transform:translate3d(0,-25%,0);}
  33.32%,45.98% {transform:translate3d(0,-50%,0);}
  49.98%,62.64% {transform:translate3d(0,-75%,0);}
  66.64%,79.3% {transform:translate3d(0,-50%,0);}
  83.3%,95.96% {transform:translate3d(0,-25%,0);}
}

@keyframes opacity {
  0%, 100% {opacity:0;}
  50% {opacity:1;}
}

@keyframes change {
  0%, 12.66%, 100% {transform:translate3d(0,0,0);}
  16.66%, 29.32% {transform:translate3d(0,-25%,0);}
  33.32%,45.98% {transform:translate3d(0,-50%,0);}
  49.98%,62.64% {transform:translate3d(0,-75%,0);}
  66.64%,79.3% {transform:translate3d(0,-50%,0);}
  83.3%,95.96% {transform:translate3d(0,-25%,0);}
}

@media only screen and (max-width: 767px) {
  .domain-input {
    width: 100%;
  }
}
</style>
