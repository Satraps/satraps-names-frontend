<template>

  <div class="container text-center">
    <h3>Delegate to the Satraps FTSO</h3>

    <hr class="mt-5">

    <!-- Wrap your SGB -->
    <div class="row mt-5">
      <h4>Step 1: Wrap your SGB to WSGB</h4>

      <div class="col-md-6 offset-md-3">
        <input 
          v-model="wrapSgbAmount"
          class="form-control text-center border-2 border-light"
          placeholder="Enter the amount of SGB to wrap"
        >
        <small class="balance" @click="enterMaxSgb">Balance: {{ getUserBalance }} {{this.getPaymentTokenName}}</small>
      </div>
    </div>

    <button
      class="btn btn-primary mt-3 mb-5"
      @click="wrapSgb"
      :disabled="waitingWsgb"
    >
      <span v-if="waitingWsgb" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      Wrap SGB
    </button>
    <!-- END: Wrap your SGB -->

    <hr>

    <!-- Delegate your WSGB -->
    <div class="row mt-5">
      <h4>Step 2: Delegate your WSGB to the Satraps FTSO</h4>

      <div class="col-md-6 offset-md-3">
        <input 
          v-model="delegatePercentageAmount"
          type="number"
          min="0"
          max="100"
          class="form-control text-center border-2 border-light"
          placeholder="What percentage of WSGB will you delegate?"
        >
        <small>Enter a number between 0 and 100.</small>
      </div>
    </div>

    <button
      class="btn btn-primary mt-3 mb-5"
      @click="delegatePercentage"
      :disabled="waitingPerc || percentageNotValid"
    >
      <span v-if="waitingPerc" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      Delegate WSGB
    </button>
    <!-- END: Delegate your WSGB -->

    <hr>

    <!-- Claim rewards -->
    <div class="row mt-5">
      <h4>Step 3: Claim rewards</h4>

      <!-- getEpochsWithUnclaimedRewards -->
    </div>

    <button
      class="btn btn-primary mt-3 mb-5"
      @click="claimRewards"
      :disabled="waitingClaim"
    >
      <span v-if="waitingClaim" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      Claim rewards
    </button>
    <!-- END: Claim rewards -->
  </div>

</template>

<script lang="ts">
import { ethers } from 'ethers';
import { useToast, TYPE } from "vue-toastification";
import { useEthers } from 'vue-dapp';
import { mapGetters, mapMutations } from 'vuex';

import FtsoRewardManager from '../abi/FtsoRewardManager.json';
import wsgbAbi from '../abi/WSGB.json';
import useChainHelpers from "../hooks/useChainHelpers";
import WaitingToast from "./toasts/WaitingToast.vue";

export default {
  name: "DelegateFtso",

  data() {
    return {
      delegatePercentageAmount: null,
      ftsoAddress: "0x9d3b56eFDF431E40D7a3C074dF8854F0A2BdfBfF",
      waitingClaim: false,
      waitingPerc: false,
      waitingWsgb: false,
      wrapSgbAmount: null,
      wsgbAddress: "0x02f0826ef6aD107Cfc861152B32B52fD11BaB9ED"
    }
  },

  computed: {
    ...mapGetters("tld", ["getTldName"]),
    ...mapGetters("user", ["getUserAddress", "getPaymentTokenName", "getUserBalance"]),

    percentageNotValid() {
      if (this.delegatePercentageAmount < 0 || this.delegatePercentageAmount > 100) {
        return true;
      }

      return false;
    }
  },

  methods: {
    ...mapMutations("user", ["subtractUserBalance"]),

    enterMaxSgb() {
      if (Number(this.getUserBalance) > 1) {
        this.wrapSgbAmount = String(Number(this.getUserBalance) - 1);
      }
    },

    async delegatePercentage() {
      this.waitingPerc = true;

      const intfc = new ethers.utils.Interface(wsgbAbi);
      const contract = new ethers.Contract(this.wsgbAddress, intfc, this.signer);

      if (Number(this.delegatePercentageAmount) > 100) {
        this.delegatePercentageAmount = 100;
      } else if (Number(this.delegatePercentageAmount) < 0) {
        this.toast("You cannot set amount lower than 0.", { type: TYPE.ERROR });
        this.waitingPerc = false;
        return;
      }

      try {
        const tx = await contract.delegate(
          this.ftsoAddress,
          Number(this.delegatePercentageAmount)*100 // multiply by 100 to get bips (basis points)
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
          this.toast("You have successfully set the percentage of WSGB that you stake to the Satraps FTSO!", {
            type: TYPE.SUCCESS,
            onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });
          this.waitingPerc = false;
        } else {
          this.toast.dismiss(toastWait);
          this.toast("Transaction has failed.", {
            type: TYPE.ERROR,
            onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });
          console.log(receipt);
          this.waitingPerc = false;
        }
      } catch (e) {
        this.waitingPerc = false;
        console.log(e);
        this.toast(e.message, {type: TYPE.ERROR});
      }
    },

    async fetchData() {
      // TODO 
      // getEpochsWithUnclaimedRewards list of epoch IDs with unclaimed rewards from the FtsoRewardManager contract
      // getStateOfRewards (for address per epoch)
      // claimReward: address and the list of epoch IDs
    },

    async wrapSgb() {
      this.waitingWsgb = true;

      const intfc = new ethers.utils.Interface(wsgbAbi);
      const contract = new ethers.Contract(this.wsgbAddress, intfc, this.signer);

      const valueWei = ethers.utils.parseEther(this.wrapSgbAmount);

      try {
        const tx = await contract.deposit({ value: valueWei });

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
          this.toast("You have successfully wrapped your SGB!", {
            type: TYPE.SUCCESS,
            onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });
          this.subtractUserBalance(Number(this.wrapSgbAmount));
          this.waitingWsgb = false;
        } else {
          this.toast.dismiss(toastWait);
          this.toast("Transaction has failed.", {
            type: TYPE.ERROR,
            onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });
          console.log(receipt);
          this.waitingWsgb = false;
        }
      } catch (e) {
        this.waitingWsgb = false;
        console.log(e);
        this.toast(e.message, {type: TYPE.ERROR});
      }
    },
  },

  setup() {
    const { address, signer } = useEthers();
    const toast = useToast();
    const { getFallbackProvider } = useChainHelpers();
    
    return { address, getFallbackProvider, signer, toast }
  },
}
</script>

<style scoped>
.balance {
  text-decoration: underline;
}

.balance:hover {
  text-decoration: none;
  cursor: pointer;
}
</style>