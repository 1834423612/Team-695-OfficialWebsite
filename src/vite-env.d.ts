/// <reference types="vite/client" />

// Fixed code error problem: [Unable to find the declaration file for module "xx.vue". xxx implicitly has an "any" type.]
// Make typescript identify .vue files
declare module '*.vue' {
    import { ComponentOptions } from 'vue'
    const componentOptions: ComponentOptions
    export default componentOptions
  }
  