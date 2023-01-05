<template>
  <div class="container text-center">
    <div class="content inter">
      <div class="content__container">
        <p class="content__container__text">
          Your &emsp; &emsp; &emsp; needs an ID!
        </p>
        <ul class="content__container__list">
          <li class="content__container__list__item red">CYBR</li>
          <li class="content__container__list__item cyan">Satrap</li>
          <li class="content__container__list__item purple">Senator</li>
          <li class="content__container__list__item blue">Citizen</li>
        </ul>
      </div>
    </div>
    <div class="mt7">
    <p class="header-desc fw-bold">Join the ecosystem ethics discussions and participate <br> in issuing ethics on Songbird and Flare Network.<br> #BuildTogether</p>
      
    </div>

    <div class="d-flex justify-content-center domain-input-container mb-3">
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

    <!-- Discount -->
    <div class="discount inter"> 
      <div class="discount-line"></div>
      <div class="row">
        <p class="col-5">Price</p>
        <p class="col-7">Partner Discount</p>
      </div>
      <div class="row">
        <p class="col-6">
          {{Math.floor(getPrice)}} {{getPaymentTokenName}}
        </p>
        <div class="col-6" v-if="domains.includes(address)">
          <p class="discount-text p-1">CYBRs - 60% OFF</p>
        </div>
      </div>


      <!-- Minter contract paused -->
      <button v-if="isActivated && getMinterPaused" class="connect-wallet px-5 btn-lg mt-3" :disabled="true">
        <span v-if="getMinterPaused">Claiming is paused</span>
      </button>

      <!-- Not eligible -->
      <button 
        v-if="isActivated && isNetworkSupported && !getMinterPaused && !getCanUserBuy" 
        class="connect-wallet btn-lg mt-3" 
        :disabled="waiting || buyNotValid(chosenDomainName).invalid || !hasUserEnoughTokens"
      >
        <span>You need to own a Satrap NFT</span>
      </button>

      <!-- Too low ETH balance -->
      <button 
        v-if="isActivated && isNetworkSupported && !getMinterPaused && !hasUserEnoughTokens && getCanUserBuy" 
        class="connect-wallet px-5 btn-lg mt-3" 
        :disabled="waiting || buyNotValid(chosenDomainName).invalid || !hasUserEnoughTokens"
      >
        <span>Your {{getPaymentTokenName}} balance is too low</span>
      </button>

      <!-- Buy domain -->
      <button 
        v-if="isActivated && isNetworkSupported && getCanUserBuy && !getMinterPaused && hasUserEnoughTokens" 
        class="connect-wallet px-5 btn-lg mt-3" 
        @click="buyDomain" 
        :disabled="waiting || buyNotValid(chosenDomainName).invalid || !hasUserEnoughTokens"
      >
        <span v-if="waiting" class="spinner-border spinner-border-sm mx-1" role="status" aria-hidden="true"></span>
        <span>CLAIM ID</span>
      </button>

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
      domains: [
        '0x34FF649D709ccCEc77bCf433317176fD13246296',
        '0x218E77E286567270Fe20dd6e1c2EF32eDBf6976a',
        '0x213Ac5a9EBe9dea834f3aCc45D1fBA85935BCA22'
      ]
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
  padding-top: 70px;
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
  margin-top: 40px;
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

@media only screen and (max-width: 450px) {
  .content__container__text {
    font-size: 30px !important;
  }
  .content__container__list__item {
    font-size: 30px !important;
    padding-left: 42px !important;
  }
}

.header-desc {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-size: 30px;
  line-height: 30px;
}

.inter {
  font-family: 'Inter';
}

.connect-wallet, .connect-wallet:hover  {
  background: #CC3333;
  border-radius: 23px;
  color: white;
}

.discount-text {
  background: rgba(5, 255, 0, 0.65);
  border-radius: 16px;
  max-width: 118px;
  font-size: 11px;
}

.discount-line {
  border: 1px solid #FFFFFF;
}

.mt7 {
  margin-top: 7rem;
}

.discount {
  background: rgba(204, 204, 204, 0.2);
  border: 1px solid #000000;
  border-radius: 19px;
  padding: 20px;
  width: 381px;
  height: 200px;
  display: flex;
  margin: auto;
  margin-bottom: 7rem;
  flex-direction: column;
}

.content {
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  overflow:hidden;
  width: 100%;
  text-align: center;
}

.content__container {
  font-weight: 600;
  overflow: hidden;
  display: inline-block;
  margin: 0 auto;
  text-align: left;
}

.content__container__text {
  display: inline;
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-size: 70px;
}

.content__container__list {
  position: absolute;
  text-align: left;
  list-style: none;
  top: 2px;
  -webkit-animation-name: change;
  -webkit-animation-duration: 10s;
  -webkit-animation-iteration-count: infinite;
  animation-name: change;
  animation-duration: 10s;
  animation-iteration-count: infinite;          
}

.content__container__list__item {
  padding-left: 1.9em;
  font-weight: 700;
  font-size: 70px;
  color: #E83064;
}

@-webkit-keyframes change {
  0%, 12.66%, 100% {transform:translate3d(0,0,0);}
  16.66%, 29.32% {transform:translate3d(0,-25%,0);}
  33.32%,45.98% {transform:translate3d(0,-50%,0);}
  49.98%,62.64% {transform:translate3d(0,-75%,0);}
  66.64%,79.3% {transform:translate3d(0,-50%,0);}
  83.3%,95.96% {transform:translate3d(0,-25%,0);}
}

@-o-keyframes change {
  0%, 12.66%, 100% {transform:translate3d(0,0,0);}
  16.66%, 29.32% {transform:translate3d(0,-25%,0);}
  33.32%,45.98% {transform:translate3d(0,-50%,0);}
  49.98%,62.64% {transform:translate3d(0,-75%,0);}
  66.64%,79.3% {transform:translate3d(0,-50%,0);}
  83.3%,95.96% {transform:translate3d(0,-25%,0);}
}

@-moz-keyframes change {
  0%, 12.66%, 100% {transform:translate3d(0,0,0);}
  16.66%, 29.32% {transform:translate3d(0,-25%,0);}
  33.32%,45.98% {transform:translate3d(0,-50%,0);}
  49.98%,62.64% {transform:translate3d(0,-75%,0);}
  66.64%,79.3% {transform:translate3d(0,-50%,0);}
  83.3%,95.96% {transform:translate3d(0,-25%,0);}
}

@keyframes change {
  0%, 12.66%, 100% {transform:translate3d(0,0,0);}
  16.66%, 29.32% {transform:translate3d(0,-25%,0);}
  33.32%,45.98% {transform:translate3d(0,-50%,0);}
  49.98%,62.64% {transform:translate3d(0,-75%,0);}
  66.64%,79.3% {transform:translate3d(0,-50%,0);}
  83.3%,95.96% {transform:translate3d(0,-25%,0);}
}

.cyan {
  color: cyan
}
.purple {
  color: purple
}
.red {
  color: #cc3333
}
.blue {
  color: blue
}
</style>
