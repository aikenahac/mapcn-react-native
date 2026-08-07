import { cn } from '@/lib/utils';
import * as SeparatorPrimitive from '@rn-primitives/separator';
import { withUniwind } from 'uniwind';

const StyledSeparatorRoot = withUniwind(SeparatorPrimitive.Root);

function Separator({
  className,
  orientation = 'horizontal',
  decorative = true,
  ...props
}: SeparatorPrimitive.RootProps & React.RefAttributes<SeparatorPrimitive.RootRef>) {
  return (
    <StyledSeparatorRoot
      decorative={decorative}
      orientation={orientation}
      className={cn(
        'bg-border shrink-0',
        orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
        className
      )}
      {...props}
    />
  );
}

export { Separator };
