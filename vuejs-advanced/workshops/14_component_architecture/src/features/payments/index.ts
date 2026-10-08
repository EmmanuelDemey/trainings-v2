/**
 * Already done for you: the payments feature, moved out of the flat folders.
 * Use it as the model for `features/invoicing/`.
 *
 * The only door into this feature. Everything else in the app imports
 * `@/features/payments`, never a file inside it — which is what makes the
 * folder's internals free to move. `PaymentRow` joins it in step 4.
 */
export { usePaymentsStore } from './stores/payments';
export type { Payment } from './types';
