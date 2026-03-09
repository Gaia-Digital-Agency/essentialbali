import React, { useState } from "react";
import Button from "./Button";
import { subscribeNewsletter } from "../../services/newsletter.service";
import { useNotification } from "../../context/NotificationContext";

// const isAxiosError = (e) => {
//   return false
// }


const Newsletter: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const { setNotification } = useNotification();

  const changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  // interface ApiResponse {
  //   message?: string;
  // }

  const clickHandler = async () => {
    try {
      const subscribe = await subscribeNewsletter(email);

      setNotification({
        message: subscribe?.data?.message ?? "Thanks for subscribing to our newsletter",
        type: "neutral",
      });

      setEmail("");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error);

      // if (isAxiosError<ApiResponse>(error)) {
      //   const serverMessage = error.response?.data?.message;
      //   setNotification({
      //     message: serverMessage ?? "Server error",
      //     type: "fail",
      //   });
      //   return;
      // }

      if (error instanceof Error) {
        setNotification({
          message: error.message,
          type: "fail",
        });
        return;
      }

      setNotification({
        message: "An unexpected error occurred",
        type: "fail",
      });
    }
  };

  return (
    <>
      <section id="newsletter" className="container bg-front-icewhite">
        <div className="md:container bg-gradient-to-b md:bg-gradient-to-r from-[#0B1D2B] to-[#4A6D8C] py-8 md:py-16 rounded-[10px]">
          <div className="container grid grid-cols-12 items-center md:items-end">
            
            <div className="col-span-12 mb-8 text-center wrapper-kiri md:mb-0 md:col-span-6 md:text-left">
              <div className="mb-5 title-wrapper">
                <p className="font-serif text-3xl leading-8 md:text-front-section-title text-front-dustly-slate">
                  Get The Essential
                </p>
              </div>
              <div className="description-wrapper">
                {/* font size 16px line height 26px */}
                <p className="font-sans font-light text-base leading-[26px] text-front-icewhite md:text-front-body">
                  The Essential guide to Bali’s modern landscape. We bring you curated News and Events, while exploring hidden Destinations and unique Stays.
                </p>
              </div>
            </div>

            <div className="col-span-12 wrapper-kanan md:col-span-6">
              <div className="flex flex-col gap-y-6 items-center inner md:flex-row md:pl-10 md:gap-y-0 md:gap-x-4 md:items-end">
                <div className="w-full input-wrapper">
                  <input
                    placeholder="Enter your email"
                    className="w-full border-b border-[#A3B1C2] h-full pt-4 pb-2 text-center md:text-left text-front-icewhite bg-transparent outline-none"
                    onChange={changeHandler}
                    type="email"
                    value={email}
                    suppressHydrationWarning={true}
                  />
                </div>
                <div className="w-full button md:w-auto">
                  <Button
                    text="Subscribe Now"
                    onClick={clickHandler}
                    bigger={true}
                    type="primary-white"
                    className="justify-center w-full whitespace-nowrap md:w-auto md:inline-flex py-3! md:py-4!"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Newsletter;
