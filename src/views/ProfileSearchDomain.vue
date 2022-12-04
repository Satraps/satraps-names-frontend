<template>
  <div class="row">
    <div class="col-md-3" id="sidebar-container">
      <Sidebar />
    </div>

    <div class="col-md-9">
      <DomainSearch />
    </div>
  </div>
</template>

<script>
import DomainSearch from "../components/DomainSearch.vue";
import Sidebar from '../components/Sidebar.vue';

export default {
  name: "ProfileSearchDomain",
  
  components: {
    DomainSearch,
    Sidebar
  }
}
</script>