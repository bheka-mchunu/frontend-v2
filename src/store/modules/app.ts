import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { lsGet, lsSet } from '@/lib/utils';
import i18n from '@/plugins/i18n';
import { LiquiditySelection } from '@/lib/utils/balancer/helpers/sor/sorManager';
import { APP } from '@/constants/app';

export enum TradeInterface {
  GNOSIS = 'gnosis',
  BALANCER = 'balancer'
}

export interface AppState {
  loading: boolean;
  modalOpen: boolean;
  darkMode: boolean;
  locale: string;
  slippage: string;
  tradeLiquidity: LiquiditySelection;
  tradeInterface: TradeInterface;
  transactionDeadline: number;
  selectedPoolTokens: string[];
}

const state: AppState = {
  loading: true,
  modalOpen: false,
  darkMode: false,
  locale: 'en-US',
  slippage: '0.01',
  tradeLiquidity: LiquiditySelection.Best,
  selectedPoolTokens: [],
  transactionDeadline: 20, // 20 minutes
  tradeInterface: APP.IsGnosisIntegration
    ? TradeInterface.GNOSIS
    : TradeInterface.BALANCER
};

const actions = {
  init: async ({ commit, dispatch }) => {
    try {
      // Set defaults from localStorage
      commit('setLocale', lsGet('locale', 'en-US'));
      commit('setDarkMode', false);
      commit('setSlippage', lsGet('slippage', '0.01'));
      commit(
        'setTradeLiquidity',
        lsGet('tradeLiquidity', LiquiditySelection.Best)
      );

      // Setup web3
      const auth = getInstance();
      const connector = await auth.getConnector();
      if (connector) dispatch('web3/login', connector, { root: true });

      // Fetch init data
      await dispatch('registry/get', null, { root: true });
      await dispatch('market/loadPrices', [], { root: true });
      await dispatch('market/getGasPrice', [], { root: true });

      // Fetch initial trade tokens
      dispatch('trade/init', null, { root: true });

      commit('setLoading', false);
    } catch (error) {
      console.error('Failed to initialize app', error);
    }
  }
};

const mutations = {
  setLoading(state: AppState, val: AppState['loading']) {
    state.loading = val;
  },

  toggleModal(state: AppState) {
    state.modalOpen = !state.modalOpen;
  },

  setLocale(state: AppState, locale: AppState['locale']) {
    state.locale = locale;
    lsSet('locale', locale);
    i18n.global.locale = locale;
  },

  setSlippage(state: AppState, slippage: AppState['slippage']) {
    state.slippage = slippage;
    lsSet('slippage', slippage);
  },

  setDarkMode(state: AppState, val: AppState['darkMode']) {
    state.darkMode = val;
    lsSet('darkMode', state.darkMode);
    if (state.darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  },

  setTradeLiquidity(state: AppState, tradeLiquidity: LiquiditySelection) {
    state.tradeLiquidity = tradeLiquidity;
    lsSet('tradeLiquidity', state.tradeLiquidity);
  },

  setSelectedPoolTokens(
    state: AppState,
    selectedPoolTokens: AppState['selectedPoolTokens']
  ) {
    state.selectedPoolTokens = selectedPoolTokens;
  },

  setTradeInterface(
    state: AppState,
    tradeInterface: AppState['tradeInterface']
  ) {
    if (APP.IsGnosisIntegration) {
      state.tradeInterface = tradeInterface;
    }
  },

  setTransactionDeadline(
    state: AppState,
    transactionDeadline: AppState['transactionDeadline']
  ) {
    state.transactionDeadline = transactionDeadline;
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
