import React, { useEffect, useState } from "react";

type AdvertisementProps = {
    ratio?: 'vertical' | 'horizontal'
}

declare global {
    interface Window {
        adsbygoogle?: any
    }
}


const Advertisement: React.FC<AdvertisementProps> = ({ratio = 'horizontal'}) => {
    const [isClient, setIsClient] = useState<boolean>(false)


    useEffect(() => {
        if(!isClient) return
        const ads = document.querySelectorAll('.adsbygoogle')

        ads.forEach(ad => {
            if(ad.getAttribute('data-adsbygoogle-status') !== 'done') {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            }
        })
    }, [isClient]);

    useEffect(() => {
        setIsClient(true)
    }, [])

    return (
        <>
            <section>
                <div className="">
                    <div className={`ads relative w-full bg-[#d9d9d9] ${ratio == 'vertical' ? 'pt-[260%]' : 'pt-[16%]'}`}>
                        <ins 
                        className="adsbygoogle absolute top-0 w-full h-full"
                        style={{display: 'block'}}
                        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                        data-ad-slot="1"
                        ></ins>
                        {/* <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            <p className="text-front-small font-semibold text-front-black">ADS PLACEMENT</p>
                        </div> */}
                    </div>
                </div>
            </section>
        </>
    )
}

export default Advertisement