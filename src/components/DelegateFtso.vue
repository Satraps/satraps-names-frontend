<template>

  <div class="container text-center">
    <h3>Delegate to the Satraps FTSO</h3>

    <p class="mt-3">Consider delegating your WSGB to the Satraps FTSO.</p>

    <hr class="mt-5">

    <!-- Wrap your SGB -->
    <div class="row mt-5">
      <h4>Wrap your SGB to WSGB</h4>

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
      <h4>Delegate your WSGB to the Satraps FTSO</h4>

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
      <h4>Claim rewards</h4>

      <p>Claimable: {{unclaimedRewards.toFixed(5)}} {{this.getPaymentTokenName}}</p>
    </div>
    
    <button
      class="btn btn-primary mt-3"
      @click="claimRewards"
      :disabled="waitingClaim || isFtsoManagerBalanceTooLow || unclaimedRewards == 0"
    >
      <span v-if="waitingClaim" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      Claim rewards
    </button>
    <p>
      <small v-if="isFtsoManagerBalanceTooLow">The FTSO Manager contract balance is too low.</small>
    </p>
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
      ftsoRewardManagerAddress: "0xc5738334b972745067fFa666040fdeADc66Cb925",
      ftsoRewardManagerBalance: 0,
      satrapsFtsoAddress: "0x9d3b56eFDF431E40D7a3C074dF8854F0A2BdfBfF",
      unclaimedEpochs: null, // epochs with unclaimed rewards (for the current user)
      unclaimedRewards: 0,
      waitingClaim: false,
      waitingPerc: false,
      waitingWsgb: false,
      wrapSgbAmount: null,
      wsgbAddress: "0x02f0826ef6aD107Cfc861152B32B52fD11BaB9ED"
    }
  },

  created() {
    this.fetchData();
  },

  computed: {
    ...mapGetters("tld", ["getTldName"]),
    ...mapGetters("user", ["getUserAddress", "getPaymentTokenName", "getUserBalance"]),

    isFtsoManagerBalanceTooLow() {
      // return true if there's not enough SGB in the official FTSO Reward Manager contract
      if (this.unclaimedRewards > this.ftsoRewardManagerBalance) {
        return true;
      }

      return false;
    },

    percentageNotValid() {
      if (this.delegatePercentageAmount < 0 || this.delegatePercentageAmount > 100) {
        return true;
      }

      return false;
    }
  },

  methods: {
    ...mapMutations("user", ["addUserBalance", "subtractUserBalance"]),

    enterMaxSgb() {
      if (Number(this.getUserBalance) > 1) {
        this.wrapSgbAmount = String(Number(this.getUserBalance) - 1);
      }
    },

    async claimRewards() {
      this.waitingClaim = true;

      const intfc = new ethers.utils.Interface(FtsoRewardManager);
      const contract = new ethers.Contract(this.ftsoRewardManagerAddress, intfc, this.signer);

      try {
        const tx = await contract.claimReward(this.address, this.unclaimedEpochs);

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
          this.toast("You have successfully claimed your rewards!", {
            type: TYPE.SUCCESS,
            onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });
          this.addUserBalance(Number(this.unclaimedRewards));
          this.fetchData();
          this.waitingClaim = false;
        } else {
          this.toast.dismiss(toastWait);
          this.toast("Transaction has failed.", {
            type: TYPE.ERROR,
            onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });
          console.log(receipt);
          this.waitingClaim = false;
        }
      } catch (e) {
        this.waitingClaim = false;
        console.log(e);
        this.toast("The transaction cannot go through. The reason may be that the reward pool is empty, so wait for a refill.", {type: TYPE.ERROR});
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
          this.satrapsFtsoAddress,
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
      if (this.signer) {
        const intfc = new ethers.utils.Interface(FtsoRewardManager);
        const contract = new ethers.Contract(this.ftsoRewardManagerAddress, intfc, this.signer);

        // list of epoch IDs with unclaimed rewards from the FtsoRewardManager contract
        this.unclaimedEpochs = await contract.getEpochsWithUnclaimedRewards(this.address);

        // calculate the total reward amount
        if (this.unclaimedEpochs) {
          this.unclaimedRewards = 0;
          for (let epoch of this.unclaimedEpochs) {
            let rewardObj = await contract.getStateOfRewards(this.address, epoch); // reward object with many data
            let formatReward = ethers.utils.formatEther(rewardObj._rewardAmounts[0]); // extract the reward amount in wei and convert it to base unit
            this.unclaimedRewards += Number(formatReward); // add formatted reward the total unclaimed reward amount
          }
        }

        // check the SGb balance in the official FTSO Reward Manager contract
        const ftsoRewardManagerBalanceWei = await this.signer.provider.getBalance(this.ftsoRewardManagerAddress);
        this.ftsoRewardManagerBalance = ethers.utils.formatEther(ftsoRewardManagerBalanceWei);
      }
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

  watch: {
    address(newVal, oldVal) {
      if (newVal) {
        this.fetchData();
      }
    },
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