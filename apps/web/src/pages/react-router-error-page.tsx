// import { useRousteError } from "react-router";
// import Image from "@/components/image/Image";

// Copied from admin-frontend
const ReactRouterErrorPage = () => {
  // const error = useRouteError();

  // useEffect(() => {
  //     const date = new Date().toISOString();

  //     if (!window.location.href.includes("localhost")) {
  //         fetch("https://api.converty.shop/api/v1/report", {
  //             method: "POST",
  //             headers: {
  //                 "Content-Type": "application/json",
  //             },
  //             body: JSON.stringify({
  //                 message: (error as any)?.message || "Unknown error",
  //                 stack: (error as any)?.stack || "Unknown stack",
  //                 createdAt: date,
  //                 source: window.location.href,
  //                 userAgent: navigator.userAgent,
  //                 project: "admin-frontend",
  //                 severity: "medium",
  //             }),
  //         });
  //     }

  //     // This will auto reload the page after 5 seconds one time
  //     if (!localStorage.getItem("lastReload")) {
  //         localStorage.setItem("lastReload", date);
  //         setTimeout(() => window.location.reload(), 3000);
  //     } else {
  //         const lastReload = new Date(localStorage.getItem("lastReload") as string);
  //         const now = new Date();
  //         if (now.getTime() - lastReload.getTime() > 300000) {
  //             localStorage.setItem("lastReload", date);
  //             setTimeout(() => window.location.reload(), 3000);
  //         }
  //     }
  // }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute top-[50%] flex w-full translate-y-[-50%] justify-center text-center font-medium">
        <div>
          <h1 className="text-2xl">Something went wrong</h1>
          <h2>Please try reloading the page</h2>
        </div>
      </div>
      {/* <Image src={"https://cdn.converty.shop/assets/error.svg"} height="115%" width="100%" alt="Error" /> */}
    </div>
  );
};

export default ReactRouterErrorPage;
