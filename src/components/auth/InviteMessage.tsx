
interface InviteMessageProps {
  hasInvite: boolean;
}

const InviteMessage = ({ hasInvite }: InviteMessageProps) => {
  if (!hasInvite) return null;
  
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
      <p className="text-blue-700">
        You're accepting an invitation to join a company.
      </p>
    </div>
  );
};

export default InviteMessage;
