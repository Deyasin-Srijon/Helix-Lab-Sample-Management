import MorphOrb from "@/components/ui/ai-thiking-orb-and-input";

export default function DemoOne(props) {
  return (
    <div className="flex min-h-[450px] w-full items-center justify-center p-4">
      <MorphOrb {...props} />
    </div>
  );
}
