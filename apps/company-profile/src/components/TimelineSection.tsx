interface TimelineSectionProps {
    title: string;
    milestones: {
      year: string;
      title: string;
      description: string;
    }[];
  }
  
  const TimelineSection: React.FC<TimelineSectionProps> = ({ title, milestones }) => {
    return (
      <div className="py-8 md:py-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12 text-center">
          <span className="inline-block mb-2">{title}</span>
          <div className="h-1 w-16 md:w-20 bg-primary-600 mx-auto"></div>
        </h2>
        
        <div className="relative max-w-4xl mx-auto px-4">
          {/* Timeline line - hidden on mobile, visible on md and up */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-primary-100"></div>
          
     
          {milestones.map((milestone, index) => (
            <div 
              key={index} 
              className={`relative mb-8 md:mb-12 flex ${
                index % 2 === 0 
                  ? 'md:justify-end md:pr-1/2' 
                  : 'md:justify-start md:pl-1/2'
              }`}
            >
              <div className={`
                relative bg-card border border-border rounded-lg shadow-md p-4 md:p-6
                md:w-[calc(100%-20px)] md:max-w-[calc(100%-20px)]
                ${index % 2 === 0 ? 'ml-12 md:ml-0' : 'ml-12 md:mr-0'}
              `}>
                {/* Year bubble - positioned differently on mobile vs desktop */}
                <div className="absolute top-4 -left-12 md:top-6 md:-mt-3 md:-translate-x-1/2 md:left-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary-600 text-primary-foreground flex items-center justify-center font-bold text-xs md:text-sm z-10">
                  {milestone.year}
                </div>
                
                {/* Content with appropriate padding */}
                <div className="ml-0 md:ml-4 md:mr-0">
                  <h3 className="text-base md:text-lg font-bold mb-1 md:mb-2 text-foreground">{milestone.title}</h3>
                  <p className="text-sm md:text-base text-muted-foreground">{milestone.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  export default TimelineSection;