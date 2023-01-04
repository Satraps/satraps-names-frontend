<template>
  <div class="row">
   <!--  <div class="col-md-3" id="sidebar-container">
      <Sidebar />
    </div> -->

    <!-- <div class="col-md-9"> -->
      <BuyDomain />
    <!-- </div> -->
  </div>
</template>

<script>
import BuyDomain from "../components/BuyDomain.vue";
import Sidebar from '../components/Sidebar.vue';

export default {
  name: "ProfileBuyDomain",
  
  components: {
    BuyDomain,
    Sidebar
  }
}
</script>
