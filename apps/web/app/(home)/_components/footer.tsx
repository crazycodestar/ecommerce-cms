import Image from "next/image";

export const Footer = () => {
    return (
        <footer className="border-t px-4 md:px-8">
            <div className="container mx-auto py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <Image src="/logo.svg" alt="logo" width={50} height={50} />
                            <span className="font-semibold text-primary">ConvertlyKit</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            <p>convertlybusinesses@gmail.com</p>
                            <p>Nigeria, Lagos Ikoyi</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <h3 className="font-semibold">Socials</h3>
                        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                            <a href="#">X</a>
                            <a href="#">LinkedIn</a>
                            <a href="#">Instagram</a>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <h3 className="font-semibold">About</h3>
                        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                            <a href="#">Contact us</a>
                            <a href="#">Terms of Service</a>
                            <a href="#">Privacy Policy</a>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <h3 className="font-semibold">Get Started</h3>
                        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                            <a href="#">Sign in</a>
                            <a href="#">Log in</a>
                            <a href="#">Pricing</a>
                            <a href="#">Blog</a>
                            <a href="#">Case Studies</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};