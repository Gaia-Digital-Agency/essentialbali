import { useState, useEffect } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import { DownloadIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Select from "../../components/form/Select";
import {
  getAllLocationByType,
  getLocationsByParentID,
} from "../../services/location.service";
import Button from "../../components/ui/button/Button";
import { RegisterPayload } from "../../types/auth.type";
import { registerUser } from "../../services/auth.service";
import useTimedMessage from "../../hooks/useTimedMessage";
import Alert from "../../components/ui/alert/Alert";
import { getTimezones } from "../../services/timezone.service";
import Badge from "../../components/ui/badge/Badge";
import { useModal } from "../../hooks/useModal";
import { GetDataTimezoneResponse } from "../../types/timezone.type";
import ModalTimezoneTable from "../../components/modal/ModalTimezoneTable";

interface optionDataInterface {
  key: string | number;
  value: string | number;
  label: string;
}

export default function Registration() {
  const [isErrorEmail, setIsErrorEmail] = useState<boolean>(false);
  const [errMessageEmail, setErrMessageEmail] = useState<string>("");

  const [showPassword, setShowPassword] = useState(false);
  const [isErrorPassword, setIsErrorPassword] = useState<boolean>(false);
  const [errMessagePassword, setErrMessagePassword] = useState<string>("");

  // const [isError, setIsError] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>("");
  // const [isSuccess, setIsSuccess] = useState<boolean>(true);
  const [successMsg, setSuccessMsg] = useState<string>("");

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [userLevel, setUserLevel] = useState("admin_country");
  const [idCity, setIdCity] = useState(0);
  const [idCountry, setIdCountry] = useState(0);
  const [timezone, setTimezone] = useState<string>("");

  const [vaDataCountry, setDataCountry] = useState<optionDataInterface[]>([]);
  const [vaDataCity, setDataCity] = useState<optionDataInterface[]>([]);
  const [vaDataTimezone, setDataTimezone] = useState<GetDataTimezoneResponse[]>([]);
  const [vaDataOptTimezone, setDataOptTimezone] = useState<optionDataInterface[]>([]);

  useTimedMessage(successMsg, setSuccessMsg);
  useTimedMessage(errorMsg, setErrorMsg);

  const {
    isOpen: isOpenModalTimezone,
    openModal: openModalTimezone,
    closeModal: closeModalTimezone,
  } = useModal();

  const validateEmail = (value: string) => {
    const isValidEmail =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
    setIsErrorEmail(false);
    setErrMessageEmail("");
    if (!isValidEmail) {
      setIsErrorEmail(true);
      setErrMessageEmail("Please input a valid email address");
    }
    return isValidEmail;
  };

  const validatePassword = (password: string) => {
    setIsErrorPassword(false);
    setErrMessagePassword("");
    if (password.length < 8) {
      setIsErrorPassword(true);
      setErrMessagePassword("Minimum Length 8 Character");
    }
    return password;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    validatePassword(value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value);
  };

  const optUserLevel = [
    { key: "admin_country", value: "admin_country", label: "Admin Bali Area" },
    { key: "admin_city", value: "admin_city", label: "Admin Sub Area" },
  ];

  const handleOptUserLevel = (value: string | number) => {
    // console.log("Selected value:", value);
    setUserLevel(String(value));
  };

  const handleOptCountry = (value: string | number) => {
    // console.log("Selected Bali Area :", value);
    setIdCountry(Number(value));
  };

  const handleOptCity = (value: string | number) => {
    // console.log("Selected City :", value);
    setIdCity(Number(value));
  };

  const handleOptTimezone = (value: string | number) => {
    // console.log("Selected Timezone :", value);timezone
    setTimezone(String(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const vaData: RegisterPayload = {
      email: email,
      name: name,
      password: password,
      user_level: userLevel,
      id_country: idCountry,
      id_city: idCity,
      timezone: timezone,
    };
    try {
      if (!validateEmail(email)) return;

      if (!name) {
        setErrorMsg("Please Input Name");
        return;
      }

      if (!validatePassword(password)) return;

      if (!idCountry) {
        setErrorMsg("Please Select Bali Area");
        return;
      }

      if (userLevel !== "admin_country" && !idCity) {
        setErrorMsg("Please Select Sub Area");
        return;
      }

      await registerUser(vaData);
      setSuccessMsg("Register Success");
      initForm();
      // console.log(response);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      }

      if (typeof err === "object" && err !== null && "response" in err) {
        const errorObj = err as { response?: { data?: { message?: string } } };
        setErrorMsg(errorObj.response?.data?.message ?? "Something went wrong");
      }
      throw err;
    }
  };

  const showModalTimezone = () => {
    openModalTimezone();
  };

  const initForm = () => {
    setEmail("");
    setName("");
    setPassword("");
    setUserLevel("");
    setIdCountry(0);
    setIdCity(0);
    setTimezone("");
  }

  useEffect(() => {
    const fetchDataCountry = async () => {
      try {
        const vaData = await getAllLocationByType("country");
        const begin = { key: 0, value: 0, label: "Select Bali Area" };
        const optDataCountry =
          vaData.data?.map((loc) => ({
            key: loc.id,
            value: loc.id,
            label: loc.name,
          })) ?? [];
        // console.log(vaData.data);
        setDataCountry([begin, ...optDataCountry]);
      } catch (error) {
        console.error(error);
      }
    };
    fetchDataCountry();
  }, []);

  useEffect(() => {
    const fetchDataTimezone = async () => {
      try {
        const vaData = await getTimezones();
        const vaTimezones = vaData.data;
        const begin = { key: 0, value: 0, label: "Select Timezone" };
        const optDataTimezone =
          vaTimezones?.map((timezone) => ({
            key: timezone.id,
            value: timezone.timezone_name,
            label: timezone.timezone_name + " - [" + timezone.utc_offset + "]",
          })) ?? [];
        setDataOptTimezone([begin, ...optDataTimezone]);
        setDataTimezone(vaTimezones);
      } catch (error) {
        console.error(error);
      }
    };

    fetchDataTimezone();
  }, []);

  useEffect(() => {
    const fetchDataCity = async () => {
      try {
        const vaData = await getLocationsByParentID("city", idCountry);
        const begin = { key: 0, value: 0, label: "Select Sub Area" };
        const optDataCity =
          vaData.data?.map((loc) => ({
            key: loc.id,
            value: loc.id,
            label: loc.name,
          })) ?? [];
        setDataCity([begin, ...optDataCity]);
      } catch (error) {
        console.error(error);
      }
    };
    fetchDataCity();
  }, [idCountry]);

  return (
    <>
      <ComponentCard title="Register New User">
        <div className="mb-5">
          {errorMsg && (
            <Alert variant="error" title="Error" message={errorMsg} />
          )}
        </div>
        <div className="mb-5">
          {successMsg && (
            <Alert variant="success" title="Success" message={successMsg} />
          )}
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-5 space-x-6 grid grid-cols-2">
            <div>
              <Label>Name</Label>
              <Input
                type="text"
                value={name}
                placeholder="John Doe"
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                error={isErrorEmail}
                onChange={handleEmailChange}
                placeholder="Enter your email"
                hint={isErrorEmail ? errMessageEmail : ""}
              />
            </div>
          </div>
          <div className="mb-5">
            <Label>Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={handlePasswordChange}
                error={isErrorPassword}
                hint={isErrorPassword ? errMessagePassword : ""}
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
              >
                {showPassword ? (
                  <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                ) : (
                  <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                )}
              </button>
            </div>
          </div>
          <div className="mb-5">
            <Label>Select Input</Label>
            <Select
              key={userLevel}
              options={optUserLevel}
              value={userLevel}
              placeholder="Select Option"
              onChange={handleOptUserLevel}
              className="dark:bg-dark-900"
            />
          </div>
          <div className="grid grid-cols-2 gap-5 mb-5">
            <div>
              <Label>Bali Area</Label>
              <Select
                options={vaDataCountry}
                value={idCountry}
                placeholder="Select Bali Area..."
                onChange={handleOptCountry}
                className="dark:bg-dark-900"
              />
            </div>
            <div>
              <Label>Sub Area</Label>
              <Select
                options={vaDataCity}
                value={idCity}
                placeholder="Select Sub Area..."
                onChange={handleOptCity}
                className="dark:bg-dark-900"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-5 mb-5">
            <div>
              <Label>
                <span className="mr-2">Time Zone</span>
                <Badge color="info" onClick={showModalTimezone}>
                  ?
                </Badge>
              </Label>
              <Select
                options={vaDataOptTimezone}
                value={timezone}
                placeholder="Select Timezone..."
                onChange={handleOptTimezone}
                className="dark:bg-dark-900"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              startIcon={<DownloadIcon className="size-5" />}
              className="w-1/4"
            >
              Save
            </Button>
          </div>
        </form>
      </ComponentCard>

      <ModalTimezoneTable
        isOpen={isOpenModalTimezone}
        onCLose={closeModalTimezone}
        timezonesData={vaDataTimezone}
      />
    </>
  );
}
