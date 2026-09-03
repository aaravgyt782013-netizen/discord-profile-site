import ProfilePageV4 from "../components/ProfilePageV4";
import ProfileEnhancements from "../components/ProfileEnhancements";
import AlwaysOnline from "../components/AlwaysOnline";
import ProfileExtras from "../components/ProfileExtras";
import ProfileUploadsTabs from "../components/ProfileUploadsTabs";
import "../components/profile-enhancements.css";
import "../components/profile-wow.css";
import "../components/profile-badge-polish.css";
import "../components/profile-publish.css";
// Keep the original profile design intact; the new feature layer is additive only.
export default function Home(){return <><ProfilePageV4/><ProfileExtras/><ProfileUploadsTabs/><ProfileEnhancements/><AlwaysOnline/></>}
