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
      <section id="newsletter" className="bg-front-section-grey py-10">
        <div className="container">
          <div className="grid grid-cols-12 items-end">
            <div className="md:col-span-6 col-span-12">
              <div className="title-wrapper mb-3">
                <p className="text-front-section-title font-serif font-semibold">
                  Newsletter
                </p>
              </div>
              <div className="description-wrapper">
                <p className="text-front-body-big">
                  Subscribe for the latest Bali updates, guides, and local picks.
                </p>
              </div>
            </div>
            <div className="md:col-span-6 col-span-12">
              <div className="inner md:pl-10 flex items-center">
                <div className="input-wrapper flex-1">
                  <input
                    placeholder="Enter your email"
                    className="w-full border-b border-[#5F5F5F] h-full py-4 pl-4"
                    onChange={changeHandler}
                    type="email"
                    value={email}
                    suppressHydrationWarning={true}
                  />
                </div>
                <div className="button">
                  <Button
                    text="SUBSCRIBE"
                    onClick={clickHandler}
                    bigger={true}
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
