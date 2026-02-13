import { useEffect, useState } from "react";
import ComponentCard from "../../../components/common/ComponentCard";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import Select from "../../../components/form/Select";
import {
  getDataSMTPConfig,
  getDataSMTPProvider,
  getDataSMTPProviderByID,
  updateSMTPConfig,
} from "../../../services/configSMTP.service";
import Switch from "../../../components/form/switch/Switch";

import { DownloadIcon } from "lucide-react";
import Button from "../../../components/ui/button/Button";
import Alert from "../../../components/ui/alert/Alert";
import useTimedMessage from "../../../hooks/useTimedMessage";
import { SMTPConfigInterface } from "../../../types/configSMTP.type";

function maskSecret(str: string, showStart = 4, showEnd = 4) {
  if (!str) return "";
  if (showStart + showEnd >= str.length) return "*".repeat(str.length);
  return (
    str.slice(0, showStart) +
    "*".repeat(str.length - showStart - showEnd) +
    str.slice(-showEnd)
  );
}

export default function ConfigSMTP() {
  const [provider, setProvider] = useState<string | number>("");
  const [dataProvider, setDataProvider] = useState<
    Array<{ key: number; value: string | number; label: string }>
  >([]);
  const [host, setHost] = useState("");
  const [port, setPort] = useState<number>(0);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [fromName, setFromName] = useState<string>("");
  const [fromEmail, setFromEmail] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [secureLabel, setSecureLabel] = useState<string>("");
  const [isSecure, setIsSecure] = useState<boolean>(false) ;

  useTimedMessage(success, setSuccess);
  useTimedMessage(error, setError);

  useEffect(() => {
    const fetchSMTPConfig = async () => {
      try {
        const response = await getDataSMTPConfig();
        const data = response?.data;
        if (data) {
          const cPassword = maskSecret(data.password ?? ""); // data.password
          setProvider(data.provider_name ?? "");
          setHost(data.host);
          setPort(data.port);
          setUsername(data.username);
          setPassword(cPassword);
          setFromName(data.from_name);
          setFromEmail(data.from_email);
          setSecureLabel(data.secure ? "Yes" : "No");
          setIsSecure(data.secure);
        }
      } catch (error: unknown) {
        console.error(error);
        throw error;
      }
    };

    fetchSMTPConfig();
  }, []);

  useEffect(() => {
    const fetchSMTPProvider = async () => {
      try {
        const response = await getDataSMTPProvider();
        const data = response?.data;
        // console.log(data);
        if (data) {
          const vaData = data.map((item) => ({
            key: item.id,
            value: item.id, //item.provider_name,
            label: item.provider_name,
          }));
          setDataProvider(vaData);
        }
      } catch (error: unknown) {
        console.error(error);
        setDataProvider([]);
      }
    };

    fetchSMTPProvider();
  }, []);

  const handleSMTPProviders = async (value: string) => {
    // console.log("Selected value:", value);
    setProvider(String(value));
    const dataDetailProvider = await getDataSMTPProviderByID(Number(value));
    const data = dataDetailProvider?.data;
    setHost(data?.host ?? "");
    // console.log("DATA PROVIDER => ", dataDetailProvider);
  };

  const handleSwitchChange = (checked: boolean) => {
    setSecureLabel(checked ? "Yes" : "No");
    setIsSecure(checked);
    // console.log("Switch is now:", checked);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const vaData: SMTPConfigInterface = {
      host: host,
      port: port,
      secure: isSecure,
      username: username,
      from_name: fromName,
      from_email: fromEmail,
      is_active: true,
    };

    // Kirim password hanya kalau bukan hasil masking (artinya user ubah)
    if (password && !password.includes("*")) {
      vaData.password = password;
    }

    if(provider){
      vaData.provider_name = Number(provider);
    }

    try {
      // console.log("IDOLAKU -> ", vaData);

      const doUpsert = await updateSMTPConfig(vaData);
      // console.log("doUpsert");
      const status_code = doUpsert?.status_code;
      if (status_code == 200) {
        setSuccess("SMTP Configuration updated successfully");
        location.reload();
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }

      if (typeof err === "object" && err !== null && "response" in err) {
        const errorObj = err as { response?: { data?: { message?: string } } };
        setError(errorObj.response?.data?.message ?? "Something went wrong");
      }
    }
  };

  return (
    <div>
      <PageMeta
        title="essentialbali Admin Dashboard | SMTP Configuration"
        description="This is SMTP Configuration Dashboard page for essentialbali Admin Dashboard Template"
      />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-1">
        <div className="space-y-12">
          <PageBreadcrumb pageTitle="SMTP Configuration" />
          <ComponentCard title="SMTP Configuration">
            <div className="mb-5">
              {error && <Alert variant="error" title="Error" message={error} />}
            </div>
            <div className="mb-5">
              {success && (
                <Alert variant="success" title="Success" message={success} />
              )}
            </div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-3 space-x-6 grid grid-cols-4">
                <div>
                  <Label>SMTP Providers</Label>
                  <Select
                    options={dataProvider}
                    // value={provider}
                    placeholder={provider}
                    onChange={(value) => { void handleSMTPProviders(String(value)); }}
                    className="dark:bg-dark-900"
                  />
                </div>
                <div>
                  <Label>Host</Label>
                  <Input
                    type="text"
                    onChange={(e) => setHost(e.target.value)}
                    // value={host}
                    placeholder={host}
                  />
                </div>
                <div>
                  <Label>Port</Label>
                  <Input
                    type="text"
                    onChange={(e) => setPort(Number(e.target.value))}
                    // value={port}
                    placeholder={port}
                  />
                </div>
                <div>
                  <Label>Secure</Label>
                  <Switch
                    label={secureLabel}
                    checked={isSecure}
                    onChange={handleSwitchChange}
                  />
                </div>
              </div>
              <div className="space-y-3 space-x-6 grid grid-cols-2">
                <div>
                  <Label>Username</Label>
                  <Input
                    type="text"
                    onChange={(e) => setUsername(e.target.value)}
                    // value={username}
                    placeholder={username}
                  />
                </div>
                <div>
                  <Label>Password</Label>
                  <Input
                    type="text"
                    onChange={(e) => setPassword(e.target.value)}
                    // value={password}
                    placeholder={password}
                  />
                  <small className="text-red-500 text-xs">
                    * Leave this field empty to keep your current password.
                  </small>
                </div>
                <div>
                  <Label>From Name</Label>
                  <Input
                    type="text"
                    onChange={(e) => setFromName(e.target.value)}
                    // value={fromName}
                    placeholder={fromName}
                  />
                </div>
                <div>
                  <Label>From Email</Label>
                  <Input
                    type="text"
                    onChange={(e) => setFromEmail(e.target.value)}
                    // value={fromEmail}
                    placeholder={fromEmail}
                  />
                </div>
              </div>
              <div className="space-y-6 space-x-6 flex justify-end">
                <Button
                  startIcon={<DownloadIcon className="size-5" />}
                  className="w-1/8"
                >
                  Save
                </Button>
              </div>
            </form>
          </ComponentCard>
        </div>
      </div>
    </div>
  );
}
