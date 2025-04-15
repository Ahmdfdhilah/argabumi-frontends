interface RankBadgerProps {
    rank: number;
}

export const RankBadge:  React.FC<RankBadgerProps>  = ({ rank }) => {
    let badgeColor = "bg-gray-200 text-gray-800";
  
    if (rank === 1) badgeColor = "bg-yellow-400 text-yellow-800";
    if (rank === 2) badgeColor = "bg-gray-300 text-gray-700";
    if (rank === 3) badgeColor = "bg-amber-600 text-amber-900";
  
    return (
      <span className={`inline-flex items-center justify-center w-6 h-6 ${badgeColor} rounded-full font-bold text-xs mr-2`}>
        {rank}
      </span>
    );
  };