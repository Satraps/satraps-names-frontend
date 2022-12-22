<template>
  <div class="container text-center">
    <img class="img-fluid main-img rounded" src="../assets/satrap.jpg" />

    <div class="text-align-header mt-5">
      <h1>Claim a free {{getTldName}} name!</h1>

      <p>If you hold a Satrap NFT, you can mint 1 free domain per Satrap* (any length).</p>
    </div>

    <div class="d-flex justify-content-center domain-input-container mb-3 mt-5">
      <div class="input-group domain-input input-group-lg input-sizing">
        <input
          v-model="chosenDomainName" 
          placeholder="enter the desired name"
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
      <span v-if="getMinterPaused">Minting paused</span>
    </button>

    <!-- Not eligible -->
    <button 
      v-if="isActivated && isNetworkSupported && !getMinterPaused && !getFreeMintEligible" 
      class="btn btn-primary btn-lg mt-3 buy-button" 
      :disabled="waiting || buyNotValid(chosenDomainName).invalid"
    >
      <span>Not eligible</span>
    </button>

    <!-- Claim domain -->
    <button 
      v-if="isActivated && isNetworkSupported && getFreeMintEligible && !getMinterPaused" 
      class="btn btn-primary btn-lg mt-3 buy-button" 
      @click="claimDomain" 
      :disabled="waiting || buyNotValid(chosenDomainName).invalid"
    >
      <span v-if="waiting" class="spinner-border spinner-border-sm mx-1" role="status" aria-hidden="true"></span>
      <span>Claim free domain</span>
    </button>

    <!-- Connect Wallet -->
    <button v-if="!isActivated" class="btn btn-primary btn-lg mt-3 btn-Disconnected" @click="open">Connect wallet</button>

    <div v-if="isActivated && !isNetworkSupported" class="mt-4">
      <button class="btn btn-primary btn-lg btn-Disconnected" @click="changeNetwork(this.getTldChainName)">Switch to {{getTldChainName}}</button>
    </div>

    <div>
      <small>
        * Once a domain is minted, the Satrap NFT will not be eligible anymore even if it's transferred or sold to another address.
      </small>
    </div>
    
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
  name: "ClaimFreeMint",

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
    ...mapGetters("user", ["getPaymentTokenAddress", "getPaymentTokenName", "getPaymentTokenAllowance", "getUserBalance", "getFreeMintEligible", "getDiscountEligible"]),
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

    async claimDomain() {
      this.waiting = true;
      const fullDomainName = this.domainLowerCase + this.getTldName;

      // check if domain already minted
      const existingHolder = await this.getTldContract.getDomainHolder(this.domainLowerCase);

      if (existingHolder !== ethers.constants.AddressZero) {
        this.toast("Sorry, but this domain name is already taken...", {type: TYPE.ERROR});
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

        const tx = await minterContractSigner.satrapFreeMint(
          this.domainLowerCase,
          this.address
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
          this.toast("You have successfully claimed the domain!", {
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
  border: 2px solid white;
  border-radius: 10px !important;
  border-collapse: separate;
  color: white;
}

.tld-addon {
  background-color: white;
  color:#0D0F1A;
}

@media only screen and (max-width: 767px) {
  .domain-input {
    width: 100%;
  }
}
</style>