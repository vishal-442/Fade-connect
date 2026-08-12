import { Link } from 'react-router-dom';
import { Store, ArrowRight } from 'lucide-react';
import { EmptyState } from '../../components/ui/Primitives';

export function NoSalonPrompt() {
  return (
    <EmptyState
      icon={Store}
      title="Set up your salon first"
      message="Register your salon profile to start adding barbers, services, and accepting bookings."
      action={
        <Link to="/owner/salon-setup" className="btn-gold mt-2">
          Set up salon <ArrowRight size={15} />
        </Link>
      }
    />
  );
}
