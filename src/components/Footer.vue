<template>
  <div class="container-fluid text-center mt-3">
    <!--<router-link v-if="isActivated && isNetworkSupported" to="/profile">Profile</router-link>
    
    <span v-if="isActivated && isNetworkSupported"> | </span>-->

    <router-link v-if="isUserMinterAdmin || isUserRoyaltyFeeUpdater || isUserTldAdmin" to="/admin">Admin</router-link>
    <span v-if="isUserMinterAdmin || isUserRoyaltyFeeUpdater || isUserTldAdmin"> | </span>
  </div>

  <div class="container-fluid text-center footer">
    <a href="https://id.satraps.io" target="_blank">
      <img src="../assets/logo.png" width="60" height="60">
    </a>
    <div class="mt-2 d-flex justify-content-center align-items-center">
      <a href="https://songbird.domains/" target="_blank" title="Songbird Domains" class="me-2">
        <img src="../assets/footer-icon.png" class="me-2">
      </a>
      <a href="https://twitter.com/TheSatraps" target="_blank" title="Satraps Twitter" class="me-2">
        <img src="../assets/twitter.png">
      </a>
      <a href="https://discord.gg/4PBswWnCdW" target="_blank" title="Satraps Discord">
        <img src="../assets/Discord.png">
      </a>
    </div>
  </div>
</template>

<script>
import { useEthers } from 'vue-dapp';
import { mapGetters } from 'vuex';

export default {
  name: "Footer",

  computed: {
    ...mapGetters("network", ["isNetworkSupported"]),
    ...mapGetters("user", ["isUserMinterAdmin", "isUserTldAdmin", "isUserRoyaltyFeeUpdater"]),
    
  },

  setup() {
    const { isActivated } = useEthers()
    return { isActivated }
  },
}
</script>

<style scoped>
a {
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

.container-fluid {
  /*background-color: #24263A;*/
  background-color: transparent;
  padding: 20px 0px;
  /*border-radius: 10px;*/
}

.icons {
  margin-left: 15px;
  margin-right: 15px;
  font-size: 2em;
}

.polygon {
  vertical-align: text-bottom;
  width: 40px;
}

.polygon svg circle {
  fill: #DBDFEA;
}

.polygon:hover svg circle {
  fill: white;
}

.footer {
  background: rgba(158, 8, 8, 0.2);
  border-bottom: 3px solid rgba(65, 7, 7, 0.8);
  border-top: 3px solid rgba(65, 7, 7, 0.8);
}
</style>
