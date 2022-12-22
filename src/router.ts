import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'

import Admin from './views/Admin.vue'
import About from './views/About.vue'
import Allowance from './views/Allowance.vue'
import BrowserExtension from './views/BrowserExtension.vue'
import ClaimFreeDomain from './views/ClaimFreeDomain.vue'
import DomainDetails from './views/DomainDetails.vue'
import Home from './views/Home.vue'
import HowItWorks from './views/HowItWorks.vue'
import MintDomains from './views/MintDomains.vue'
import Profile from './views/Profile.vue'
import ProfileBuyDomain from './views/ProfileBuyDomain.vue'
import ProfileClaimFreeDomain from './views/ProfileClaimFreeDomain.vue'
import ProfileDelegateFtso from './views/ProfileDelegateFtso.vue'
import ProfileSearchDomain from './views/ProfileSearchDomain.vue'
import ProfileSendTokens from './views/ProfileSendTokens.vue'
import SearchDomains from './views/SearchDomains.vue'
import SendTokens from './views/SendTokens.vue'
import TransferDomain from './views/TransferDomain.vue'

// For info on using Vue Router with the Composition API, see https://next.router.vuejs.org/guide/advanced/composition-api.html

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/about',
    name: 'About',
    component: About,
  },
  {
    path: '/admin',
    name: 'Admin',
    component: Admin,
  },
  {
    path: '/allowance',
    name: 'Allowance',
    component: Allowance,
  },
  {
    path: '/browser',
    name: 'BrowserExtension',
    component: BrowserExtension,
  },
  {
    path: '/claim-free-domain',
    name: 'ClaimFreeDomain',
    component: ClaimFreeDomain,
  },
  {
    path: '/domain/:domainChain/:tld/:domainName',
    name: 'DomainDetails',
    component: DomainDetails,
    props: true
  },
  {
    path: '/how',
    name: 'HowItWorks',
    component: HowItWorks,
  },
  {
    path: '/mint-domains',
    name: 'MintDomains',
    component: MintDomains,
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
  },
  {
    path: '/profile/buy-domain',
    name: 'ProfileBuyDomain',
    component: ProfileBuyDomain,
  },
  {
    path: '/profile/claim-free-domain',
    name: 'ProfileClaimFreeDomain',
    component: ProfileClaimFreeDomain,
  },
  {
    path: '/profile/delegate-ftso',
    name: 'ProfileDelegateFtso',
    component: ProfileDelegateFtso,
  },
  {
    path: '/profile/search-domain',
    name: 'ProfileSearchDomain',
    component: ProfileSearchDomain,
  },
  {
    path: '/profile/send-tokens',
    name: 'ProfileSendTokens',
    component: ProfileSendTokens,
  },
  {
    path: '/search-domain',
    name: 'SearchDomains',
    component: SearchDomains,
  },
  {
    path: '/send-tokens',
    name: 'SendTokens',
    component: SendTokens,
  },
  {
    path: '/transfer/:tld/:domainName',
    name: 'TransferDomain',
    component: TransferDomain,
    props: true
  },
  // Fallback route for handling 404s
  {
    path: '/:pathMatch(.*)*',
    name: '404',
    component: () => import('./views/Error404.vue'),
  },
]

const router = createRouter({
  // If app is not hosted at the domain root, make sure to pass the `base` input here: https://next.router.vuejs.org/api/#parameters
  history: createWebHashHistory(),
  routes,
})

export default router
