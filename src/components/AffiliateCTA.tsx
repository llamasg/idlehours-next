import { Button } from "@/components/ui/button";

interface AffiliateCTAProps {
  value: {
    buttonText: string;
    url: string;
    disclaimer?: string;
  };
}

const AffiliateCTA = ({ value }: AffiliateCTAProps) => {
  return (
    <div className="my-8 rounded-xl border border-primary/30 bg-primary/5 p-6">
      <a
        href={value.url}
        target="_blank"
        rel="sponsored nofollow noopener noreferrer"
        className="block"
      >
        <Button className="w-full rounded-full font-heading text-sm uppercase tracking-wider sm:w-auto">
          {value.buttonText}
          <span className="ml-2 inline-block shrink-0 bg-current" style={{ width: '16px', height: '16px', WebkitMask: 'url(/images/icons/icon_click-hover-mouse-tap-cursor.svg) no-repeat center / contain', mask: 'url(/images/icons/icon_click-hover-mouse-tap-cursor.svg) no-repeat center / contain' }} />
        </Button>
      </a>
      {value.disclaimer && (
        <p className="mt-3 text-xs text-muted-foreground">
          {value.disclaimer}
        </p>
      )}
    </div>
  );
};

export default AffiliateCTA;
