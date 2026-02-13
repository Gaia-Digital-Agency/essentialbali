import React from 'react'
import 'react-loading-skeleton/dist/skeleton.css'
import Header from '../pages/Front/Templates/Header'
import Footer from '../pages/Front/Templates/Footer'
// import "../index.css"
import { NotificationProvider } from '../context/NotificationContext'
import { Outlet } from 'react-router'
// import '../non-critical.css';
// import ProtectedRoute from '../components/ProtectedRoute'
// import 'flowbite'
// import 'rsuite/dist/rsuite.min.css';

// export type RegionProps = {id: number, slug: string, name: string, id_parent?: number}
// export type CityProps = {id: number, slug: string, name: string, id_parent?: number, regions: RegionProps[]}
// export type CountryProps = {id: number, slug: string, name: string, cities: CityProps[]}


const FrontLayout: React.FC = () => {
    return (
        <>
                {/* <ProtectedRoute> */}
                    <Header /> 
                        <NotificationProvider>
                            <Outlet />
                        </NotificationProvider>
                    <Footer />
                {/* </ProtectedRoute> */}
        </>
    )
}

export default FrontLayout