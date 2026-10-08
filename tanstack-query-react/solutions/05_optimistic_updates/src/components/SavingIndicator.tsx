import { useIsMutating } from '@tanstack/react-query';
import { issueMutationKeys } from '../queries/issues';

/**
 * Lives in the header, far from the rows and the form that write. It reads the
 * MUTATION cache: how many mutations whose key starts with `['issues']` are in
 * flight, whichever component started them.
 */
export function SavingIndicator() {
  const saving = useIsMutating({ mutationKey: issueMutationKeys.all });

  return saving > 0 ? (
    <span className="muted" data-testid="saving">
      Saving…
    </span>
  ) : null;
}
