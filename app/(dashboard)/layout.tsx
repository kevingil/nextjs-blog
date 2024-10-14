'use client';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex flex-col mt-12">
      {children}
    </section>
  );
}
