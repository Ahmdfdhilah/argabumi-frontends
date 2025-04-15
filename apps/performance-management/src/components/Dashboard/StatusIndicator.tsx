interface StatusIndicatorProps {
    status: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
    let statusColor = "";
    let statusIcon = null;
  
    switch (status) {
      case 'On Track':
        statusColor = "text-green-500";
        statusIcon = <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>;
        break;
      case 'At Risk':
        statusColor = "text-yellow-500";
        statusIcon = <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>;
        break;
      case 'Behind':
        statusColor = "text-red-500";
        statusIcon = <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>;
        break;
      default:
        statusColor = "text-gray-500";
        statusIcon = <div className="w-2 h-2 rounded-full bg-gray-500 mr-2"></div>;
    }
  
    return (
      <div className="flex justify-center">
        <div className={`flex items-center ${statusColor}`}>
          {statusIcon}
          <span>{status}</span>
        </div>
      </div>
    );
  };