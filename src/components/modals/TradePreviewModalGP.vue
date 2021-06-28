<template>
  <BalModal show @close="onClose" :title="$t('previewTrade')">
    <div>
      <div class="relative mb-6">
        <div
          class="p-3 bg-gray-50 border border-gray-100 rounded-tr-lg rounded-tl-lg"
        >
          {{ $t('effectivePrice') }}
          {{
            order.exactIn
              ? order.effectivePriceMessage.tokenIn
              : order.effectivePriceMessage.tokenOut
          }}
        </div>
        <div
          class="rounded-bl-lg rounded-br-lg border-gray-100 border-b border-l border-r shadow-lg"
        >
          <div class="p-3 border-gray-100 border-b relative">
            <div class="flex items-center">
              <div class="mr-3">
                <BalAsset :address="order.tokenIn?.address" :size="36" />
              </div>
              <div>
                <div class="font-medium">
                  {{ order.amountOutFormatted }} {{ order.tokenIn?.symbol }}
                </div>
                <div class="text-gray-500 text-sm">
                  {{ order.valueIn }}
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
                <BalAsset :address="order.tokenOut?.address" :size="36" />
              </div>
              <div>
                <div class="font-medium">
                  {{ order.amountOutFormatted }}
                  {{ order.tokenOut?.symbol }}
                </div>
                <div class="text-gray-500 text-sm">
                  {{ order.valueOut }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <BalCard noPad>
        <template v-slot:header>
          <div class="p-3 flex w-full items-center justify-between border-b">
            <div class="font-bold">{{ $t('summary') }}</div>
            <div class="flex divide-x">
              <div class="pr-1">{{ $t('tokens') }}</div>
              <div class="pl-1">USD</div>
            </div>
          </div>
        </template>
        <div class="p-3">
          <div class="flex">
            <div>{{ $t('amountBeforeFees') }}</div>
            <div>
              {{
                order.exactIn
                  ? fNum(order.amountOut, 'token')
                  : fNum(order.amountIn, 'token')
              }}
            </div>
          </div>
        </div>
      </BalCard>
      <div>
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
              {{ $t('trade') }} {{ order.valueIn }}
              {{ order.tokenIn?.symbol }} ->
              {{ order.tokenOut?.symbol }}
            </div>
          </div>
        </div>
      </div>
      <BalBtn
        v-if="requiresApproval && !isApproved"
        class="mt-5"
        :label="`${$t('approve')} ${order.tokenIn?.symbol}`"
        :loading="approving"
        :loading-label="`${$t('approving')} ${order.tokenIn?.symbol}…`"
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
    </div>
  </BalModal>
</template>

<script lang="ts">
import { defineComponent, toRefs, computed, ref, PropType } from 'vue';

import useNumbers from '@/composables/useNumbers';
import useTokenApprovalGP from '@/composables/trade/useTokenApprovalGP';
import useGnosisProtocol from '@/composables/useGnosisProtocol';
import useTokens from '@/composables/useTokens';
import { bnum } from '@balancer-labs/sor2/dist/bmath';
import { Token } from '@/types';

type Order = {
  exactIn: boolean;
  amountIn: string;
  amountOut: string;
  tokenIn: Token;
  tokenOut: Token;
  isEthTrade: boolean;
  isWrap: boolean;
  isUnwrap: boolean;
  effectivePriceMessage: {
    tokenIn: string;
    tokenOut: string;
  };
  minimumOutAmountScaled: string;
  maximumInAmountScaled: string;
  feeAmountOutToken: string;
  feeAmountInToken: string;
  requiresApproval: boolean;
};

export default defineComponent({
  emits: ['trade', 'close'],
  props: {
    open: {
      type: Boolean,
      default: false
    },
    trading: {
      type: Boolean,
      required: true
    },
    order: {
      type: Object as PropType<Order>,
      required: true
    }
  },
  setup(props, { emit }) {
    // COMPOSABLES
    const { fNum } = useNumbers();
    const { gnosisExplorer } = useGnosisProtocol();
    const { allTokensIncludeEth: tokens } = useTokens();

    // DATA
    const { order } = toRefs(props);
    const summaryPriceInFiat = ref(false);
    // COMPUTED

    // const summary = computed(() => ({
    //   amountBeforeFees: exactIn.value,
    //   solverFees: exactIn.value ? feeAmountOutToken.value ? feeAmountInToken.value,
    //   minRecevied: min
    // }));

    const addressIn = computed(() => order.value.tokenIn?.address);

    const amountIn = computed(() => order.value.amountIn);

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
      isApproved,
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
