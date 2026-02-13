import { useLocation, useNavigate } from "react-router";

export const usePreserveQueryParamsNavigate = () => {
    function preserveQuery(path: string, stringOnly: true): string;
    function preserveQuery(path: string, stringOnly: false): void;
    function preserveQuery(path: string, stringOnly: boolean) {
        const navigate = useNavigate()
        const {search} = useLocation()
        if(stringOnly) return path+search
        navigate(path+search)
    }
    return preserveQuery
}