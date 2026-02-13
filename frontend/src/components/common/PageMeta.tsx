// import { HelmetProvider, Helmet } from "react-helmet-async";

const PageMeta = ({title,
  description}: {
  title: string;
  description: string;
}) => (
  <>
    <title>{title}</title>
    <meta name="description" content={description} />
  </>
);

export const AppWrapper = () => (
  <></>
);

export default PageMeta;











// import { HelmetProvider, Helmet } from "react-helmet-async";

// const PageMeta = ({
//   title,
//   description,
// }: {
//   title: string;
//   description: string;
// }) => (
//   <Helmet>
//     <title>{title}</title>
//     <meta name="description" content={description} />
//   </Helmet>
// );

// export const AppWrapper = ({ children }: { children: React.ReactNode }) => (
//   <HelmetProvider>{children}</HelmetProvider>
// );

// export default PageMeta;
