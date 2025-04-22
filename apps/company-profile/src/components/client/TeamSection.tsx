import { Section } from '@workspace/ui/components/ui/section';

interface TeamMember {
  id: number;
  name: string;
  position: string;
  bio: string;
  image: string;
}

interface TeamSectionProps {
  title: string;
  members: TeamMember[];
}
const TeamSection = ({ title,  members }: TeamSectionProps) => {
  return (
    <Section className='px-4 md:px-8 lg:px-16'>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">{title}</h2>
        <div className="h-1 w-20 bg-green-500 mx-auto mt-4"></div>
      </div>
      
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {members.map((member) => (
          <div key={member.id} className="text-center">
            <div className="w-48 h-48 mx-auto rounded-full overflow-hidden mb-4">
              <img 
                src={member.image} 
                alt={member.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-xl font-bold">{member.name}</h3>
            <p className="text-green-600 mb-2">{member.position}</p>
            <p className="text-gray-600 text-sm">{member.bio}</p>
          </div>
        ))}
      </div>
    </Section>
  );
};

export default TeamSection;