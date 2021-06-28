<template>
  <BalModal :show="open" @close="onClose" :title="$t('previewTrade')">
    <div>
      <div class="relative">
        <div
          class="p-3 bg-gray-50 border border-gray-100 rounded-tr-lg rounded-tl-lg"
        >
          {{ $t('effectivePrice') }}
          {{
            exactIn
              ? effectivePriceExactInMessage
              : effectivePriceExactOutMessage
          }}
        </div>
        <div
          class="rounded-bl-lg rounded-br-lg border-gray-100 border-b border-l border-r shadow-lg"
        >
          <div class="p-3 border-gray-100 border-b relative">
            <div class="flex items-center">
              <div class="mr-3">
                <BalAsset :address="addressIn" :size="36" />
              </div>
              <div>
                <div class="font-medium">
                  {{ fNum(amountIn, 'token') }} {{ symbolIn }}
                </div>
                <div class="text-gray-500 text-sm">
                  {{ fNum(valueIn, 'usd') }}
                </div>
              </div>
            </div>
          </div>
          <div class="arrow-down">
            <ArrowDownIcon />
          </div>
          <div class="p-3">
            <div class="flex items-center">
              <div class="mr-3">
                <BalAsset :address="addressOut" :size="36" />
              </div>
              <div>
                <div class="font-medium">
                  {{ fNum(amountOut, 'token') }} {{ symbolOut }}
                </div>
                <div class="text-gray-500 text-sm">
                  {{ fNum(valueOut, 'usd') }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div v-if="formattedFeeAmount > 0" class="mt-6 mb-3 text-sm">
          Fee: {{ fNum(formattedFeeAmount, 'token') }}
          {{ symbolIn }}
        </div>
        <div class="mt-6 mb-3 text-sm">
          Requires {{ requiresApproval ? 2 : 1 }}
          {{ requiresApproval ? 'transactions' : 'transaction' }}:
        </div>
        <div>
          <div
            v-if="requiresApproval"
            class="p-3 flex items-center border rounded-lg"
          >
            <div
              class="w-9 h-9 flex items-center justify-center border rounded-full text-green-500"
            >
              <BalIcon v-if="isApproved" name="check" class="text-green-500" />
              <span v-else class="text-gray-500">1</span>
            </div>
            <div class="ml-3">
              <span v-if="isApproved">{{ $t('approved') }}</span>
              <span v-else>{{ $t('approve') }}</span>
            </div>
          </div>
          <div class="mt-3 p-3 flex items-center border rounded-lg">
            <div
              class="w-9 h-9 flex items-center justify-center border rounded-full text-gray-500"
            >
              {{ requiresApproval ? 2 : 1 }}
            </div>
            <div class="ml-3">
              {{ $t('trade') }} {{ fNum(valueIn, 'usd') }} {{ symbolIn }} ->
              {{ symbolOut }}
            </div>
          </div>
        </div>
      </div>
      <BalBtn
        v-if="requiresApproval && !isApproved"
        class="mt-5"
        :label="`${$t('approve')} ${symbolIn}`"
        :loading="approving"
        :loading-label="`${$t('approving')} ${symbolIn}…`"
        color="gradient"
        block
        @click.prevent="approve"
      />
      <BalBtn
        v-else
        class="mt-5"
        :label="$t('confirmTrade')"
        :loading="trading"
        :loading-label="$t('confirming')"
        color="gradient"
        block
        @click.prevent="trade"
      />
      <div class="m-1" v-if="orderId">
        <BalLink :href="gnosisExplorer.orderLink(orderId)" external class="m1">
          Track order
        </BalLink>
      </div>
    </div>
  </BalModal>
</template>

<script lang="ts">
import { defineComponent, toRefs, computed } from 'vue';

import useNumbers from '@/composables/useNumbers';
import useTokenApprovalGP from '@/composables/trade/useTokenApprovalGP';
import useGnosisProtocol from '@/composables/useGnosisProtocol';
import useTokens from '@/composables/useTokens';

export default defineComponent({
  emits: ['trade', 'close'],
  props: {
    open: {
      type: Boolean,
      default: false
    },
    addressIn: {
      type: String,
      required: true
    },
    amountIn: {
      type: String,
      required: true
    },
    addressOut: {
      type: String,
      required: true
    },
    amountOut: {
      type: String,
      required: true
    },
    trading: {
      type: Boolean,
      required: true
    },
    orderId: {
      type: String
    },
    formattedFeeAmount: {
      type: String,
      required: true
    },
    isWrap: {
      type: Boolean,
      required: true
    },
    isUnwrap: {
      type: Boolean,
      required: true
    },
    exactIn: {
      type: Boolean,
      required: true
    },
    isEthTrade: {
      type: Boolean,
      required: true
    },
    effectivePriceExactInMessage: {
      type: String,
      required: true
    },
    effectivePriceExactOutMessage: {
      type: String,
      required: true
    }
  },
  setup(props, { emit }) {
    // COMPOSABLES
    const { fNum, toFiat } = useNumbers();
    const { gnosisExplorer } = useGnosisProtocol();
    const { allTokensIncludeEth: tokens } = useTokens();

    // DATA
    const { addressIn, amountIn, amountOut, addressOut } = toRefs(props);

    // COMPUTED
    const valueIn = computed(() => toFiat(amountIn.value, addressIn.value));

    const valueOut = computed(() => toFiat(amountOut.value, addressOut.value));

    const symbolIn = computed(
      () => tokens.value[addressIn.value]?.symbol ?? ''
    );

    const symbolOut = computed(
      () => tokens.value[addressOut.value]?.symbol ?? ''
    );

    const requiresApproval = computed(() => {
      if (props.isWrap || props.isUnwrap || props.isEthTrade) return false;
      return true;
    });

    const { approving, allowanceState, approve } = useTokenApprovalGP(
      addressIn,
      amountIn,
      tokens
    );

    const isApproved = computed(() => {
      return allowanceState.value.isUnlocked;
    });

    // METHODS
    function trade() {
      emit('trade');
    }

    function onClose() {
      emit('close');
    }

    return {
      // methods
      fNum,
      onClose,
      approve,
      trade,
      gnosisExplorer,

      // computed
      requiresApproval,
      isApproved,
      valueIn,
      valueOut,
      symbolIn,
      symbolOut,
      approving
    };
  }
});
</script>
<style scoped>
.arrow-down {
  @apply absolute right-0 rounded-full border border-gray-100 flex items-center h-8 w-8 justify-center bg-white mr-3;
  transform: translateY(-50%);
}
</style>
