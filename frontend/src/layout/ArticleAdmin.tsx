import React, {useState, Suspense} from "react"
import { Outlet, useNavigate } from "react-router"
import ComponentCard from "../components/common/ComponentCard"
import PageAdminTitle from "../components/common/PageAdminTitle"

export type ContextPageAdminButtonText = {
    pageAdminButtonText: string,
    setPageAdminButtonText: React.Dispatch<React.SetStateAction<string>>
}
export type ContextPageAdminButtonOnClick = {
    pageAdminButtonOnClick: () => void,
    setPageAdminButtonText: React.Dispatch<React.SetStateAction<() => void>>
}

const ArticleAdmin: React.FC = () => {
    const navigate = useNavigate()
    const [pageAdminButtonText, setPageAdminButtonText] = useState<string>("Add Article")
    const [pageAdminButtonOnClick, setPageAdminButtonOnClick] = useState<() => void>(() => () => {
        navigate('/admin/mst_article/add')
    })

    return (
        <>
            <PageAdminTitle pageTitle="Article" buttonText={pageAdminButtonText} onClick={pageAdminButtonOnClick}>

            </PageAdminTitle>
            <ComponentCard title="">
                <Suspense fallback={<div className="flex items-center justify-center p-10">Loading article...</div>}>
                    <Outlet context={{pageAdminButtonText, setPageAdminButtonText, pageAdminButtonOnClick, setPageAdminButtonOnClick}} />
                </Suspense>
            </ComponentCard>
        </>
    )
}

export default ArticleAdmin