/**
 * Get the CSS class for a status badge based on the show status.
 */
export function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'ready':
      return 'badge badge-ready';
    case 'processing':
      return 'badge badge-processing';
    case 'error':
      return 'badge badge-error';
    default:
      return 'badge badge-pending';
  }
}
