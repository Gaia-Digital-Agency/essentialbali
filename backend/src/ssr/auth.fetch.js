import authService from "../services/auth.service.js";

export const fetchAuth = async (req) => {
    const copyReq = {...req}
    try {
        // copyReq.cookies.token = copyReq.cookies.jwt
        // console.log(copyReq, 'copyreq')
        const getAuth = await authService.getUserById(copyReq)
        return getAuth
    } catch(e) {
        try {
            const tryRefresh = await authService.refreshToken(copyReq)
            if(tryRefresh && tryRefresh.token) {
                const getToken = await authService.getUserById({cookies: {token: tryRefresh.token}})
                return getToken
            }
        } catch(e) {
            return undefined
        }
        return undefined
    }
}