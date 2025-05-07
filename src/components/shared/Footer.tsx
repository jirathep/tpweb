export default function Footer() {
  return (
    <footer className="bg-background border-t border-border py-6 text-center">
      <div className="container mx-auto px-4">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Prompt eTicket. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
