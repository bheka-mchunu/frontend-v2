<template>
  <div class="app-nav-toggle">
    <router-link
      :to="{ name: 'home' }"
      :class="[
        'toggle-link pl-6 pr-4 border-l rounded-l-full',
        { [activeClasses]: !isInvestPage && !isPoolPage && !isEarnPage }
      ]"
      @click="trackGoal(Goals.ClickNavTrade)"
    >
      {{ $t('trade') }}
    </router-link>
    <router-link
      :to="{ name: 'earn' }"
      :class="['toggle-link pl-4 pr-6', { [activeClasses]: isEarnPage }]"
      @click="trackGoal(Goals.ClickNavInvest)"
    >
      {{ $t('Earn') }}
    </router-link>
    <router-link
      :to="{ name: 'invest' }"
      :class="[
        'toggle-link pl-4 pr-6 border-r rounded-r-full',
        { [activeClasses]: isInvestPage || isPoolPage }
      ]"
      @click="trackGoal(Goals.ClickNavInvest)"
    >
      {{ $t('invest') }}
    </router-link>
  </div>
</template>

<script lang="ts">
import useFathom from '@/composables/useFathom';
import { computed, defineComponent } from 'vue';
import { useRoute } from 'vue-router';

export default defineComponent({
  name: 'AppNavToggle',

  setup() {
    const route = useRoute();
    const activeClasses = 'bg-black border-black text-white';
    const isInvestPage = computed(() => route.name === 'invest');
    const isPoolPage = computed(() => route.name === 'pool');
    const isEarnPage = computed(() => route.name === 'earn');
    const { trackGoal, Goals } = useFathom();

    return {
      isInvestPage,
      isPoolPage,
      activeClasses,
      isEarnPage,
      trackGoal,
      Goals
    };
  }
});
</script>

<style scoped>
.app-nav-toggle {
  @apply h-10 flex items-center font-medium;
}

.toggle-link {
  @apply h-full flex items-center shadow border-t border-b;
}
</style>
