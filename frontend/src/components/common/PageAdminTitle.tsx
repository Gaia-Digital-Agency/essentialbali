import PageBreadcrumb from "./PageBreadCrumb";
import Button from "../ui/button/Button";

interface PageAdminTitleProps {
  pageTitle: string;
  buttonText?: string,
  onClick?: () => void
}

const PageAdminTitle: React.FC<PageAdminTitleProps> = ({ pageTitle, buttonText, onClick }) => {
  const renderButton = () => {
    if(buttonText) {
      const onClickHandler = onClick ?? (() => {return})
      return (
        <Button onClick={onClickHandler}>
          {buttonText}
        </Button>
      )
    }
    return (<></>)
  }
  
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div className="title-wrapper flex items-center gap-x-6">
        <h2
          className="text-xl font-semibold text-gray-800 dark:text-white/90"
          x-text="pageName"
        >
          {pageTitle}
        </h2>
        {renderButton()}
      </div>
      <PageBreadcrumb pageTitle={pageTitle} />
    </div>
  );
};

export default PageAdminTitle;
