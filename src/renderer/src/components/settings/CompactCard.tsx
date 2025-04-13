import * as React from "react"
import { cn } from "../../lib/utils"

// 紧凑版卡片组件
const CompactCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-md border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
CompactCard.displayName = "CompactCard"

const CompactCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1 p-3", className)}
    {...props}
  />
))
CompactCardHeader.displayName = "CompactCardHeader"

const CompactCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-base font-medium leading-none",
      className
    )}
    {...props}
  />
))
CompactCardTitle.displayName = "CompactCardTitle"

const CompactCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-xs text-muted-foreground", className)}
    {...props}
  />
))
CompactCardDescription.displayName = "CompactCardDescription"

const CompactCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-3 pt-0", className)} {...props} />
))
CompactCardContent.displayName = "CompactCardContent"

const CompactCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-3 pt-0", className)}
    {...props}
  />
))
CompactCardFooter.displayName = "CompactCardFooter"

export { 
  CompactCard, 
  CompactCardHeader, 
  CompactCardFooter, 
  CompactCardTitle, 
  CompactCardDescription, 
  CompactCardContent 
}
