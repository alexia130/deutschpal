type PageHeaderProps = {
  title: string;
  subtitle: string;
};

function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <header className="mb-9">
      <h1 className="text-3xl font-semibold tracking-tight text-[#1F1D1B]">
        {title}
      </h1>

      <p className="mt-2 text-base text-[#77716B]">
        {subtitle}
      </p>
    </header>
  );
}

export default PageHeader;