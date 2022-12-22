<template>
  <div class="row">
    <div class="col-md-3" id="sidebar-container">
      <Sidebar />
    </div>

    <div class="col-md-9">
      <ClaimFreeMint />
    </div>
  </div>
</template>

<script>
import ClaimFreeMint from "../components/ClaimFreeMint.vue";
import Sidebar from '../components/Sidebar.vue';

export default {
  name: "ProfileClaimFreeDomain",
  
  components: {
    ClaimFreeMint,
    Sidebar
  }
}
</script>