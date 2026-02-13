import React from "react"
import PageAdminTitle from "../../../components/common/PageAdminTitle";
import ComponentCard from "../../../components/common/ComponentCard";
import Button from "../../../components/ui/button/Button";
import { Link, useOutletContext } from "react-router";
import { CountryProps } from "../../../layout/TemplateLayout";
import { useAuth } from "../../../context/AuthContext";

// interface LocationProps {
//     data: CountriesProps[]
// }

// export type LocationsContextProps = {
//     locations: CountryProps[]
// }

type RenderLocationsProps = {
    link: string,
    title: string,
    depth?: 0 | 1 | 2,
    type?: "" | "Area" | "Sub Area" | "Local Zone"
}
// ml-0 ml-4 ml-8

const RenderLocations = ({link, title, depth = 0, type = ''}: RenderLocationsProps) => {
    return (
        <>
            <div className={`article-post p-6 shadow rounded flex justify-between items-center ml-${4 * depth}`}>
                <div className="inner">
                    <div className="title-wrapper">
                        {type && <p className="text-xs opacity-[.4]">{type}</p>}
                        <p className="text-xl">{title}</p>
                    </div>
                </div>
                <div className="action flex items-center gap-x-4">
                    <Button>
                        <Link to={{pathname: `/admin/mst_templates/edit/`, search: `?url=${link}&template=Home`}}>Edit</Link>
                    </Button>
                </div>
            </div>
        </>
    )
}

const RenderBaliHome: React.FC = () => {
    const {userDetails} = useAuth()
    if(userDetails && userDetails.user_level == 'super_admin') {
        return (
            <ComponentCard>
                <RenderLocations title="Bali" link="/" />
            </ComponentCard>
        )
    }
    return (
        <></>
    )
}

const MstTemplates: React.FC = () => {
    const {locations} = useOutletContext<{locations: CountryProps[]}>()
    if(locations) {
        return (
            <>
                <PageAdminTitle pageTitle="Templates" />
                <ComponentCard title="Bali Areas">
                    <div className="grid grid-cols-12 gap-6">
                        <div className="col-span-12">
                            <RenderBaliHome />
                        </div>
                        {locations?.map(location => (
                            <ComponentCard key={location.id} title={location.name} className="col-span-6">
                                <ul>
                                    <li>
                                        <RenderLocations title={location.name} link={`/${location.slug}`} type="Area" />
                                        <ul>
                                            {location.cities?.map(city => (
                                                <li key={city.id}>
                                                    <RenderLocations title={city.name} link={`/${location.slug}/${city.slug}`} depth={1} type="Sub Area" />
                                                    <ul>
                                                        {city.regions?.map(region => (
                                                            <RenderLocations title={region.name} link={`/${location.slug}/${city.slug}/${region.slug}`} depth={2} type="Local Zone" />
                                                            // <li key={region.id}>{region.name}</li>
                                                        ))}
                                                    </ul>
                                                </li>
                                            ))}
                                        </ul>
                                    </li>
                                </ul>
                            </ComponentCard>
                        ))}

                    </div>
                </ComponentCard>
            </>
        )
    } else {
            <>
                <PageAdminTitle pageTitle="Templates" />
                <ComponentCard title="Templates">
                    <>Loading</>
                </ComponentCard>
            </>
    }
}

export default MstTemplates
