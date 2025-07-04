import { Button } from "@/components/ui/button";
import Link from "next/link";


export default function Scheduler() {
  return (
    <div>
      <Link
        href="https://docs.google.com/spreadsheets/d/1Sa5ygJPIGLfAWWT_bMZvozRLvyyu5coJYKfhTqA28Ls/edit?usp=drive_link"
       target="_blank"
      >
        <Button>Edit Schedule</Button>
      </Link>
      <iframe
        className="w-[90vw] md:w-[75vw] lg:w-[75vw] h-[70vh]"
        src="https://docs.google.com/spreadsheets/d/e/2PACX-1vT9ga6qA2CQmSBv5mLnVoX84E6p0gENkxDGPWripVmzaU6hTDangBpU-Y_sIc0xLKx_-Bz6Dspn-F-G/pubhtml?gid=0&amp;single=true&amp;widget=true&amp;headers=false"
      ></iframe>
    </div>
  );
}
