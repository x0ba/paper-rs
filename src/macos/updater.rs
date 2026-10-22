//! Updating the installed app with Sparkle. Ported from terminal-rs
//! (`crates/macos/src/updater.rs`), another project by the same author.
//!
//! `scripts/release-macos.sh` embeds Sparkle.framework, and `packaging/macos/Info.plist` names
//! the update feed and the key every update must be signed with. Sparkle is loaded at run time
//! rather than linked, so `cargo build` and `cargo run` builds run without it, and
//! [`check_for_updates`] opens the latest release instead.

use objc2::rc::{Allocated, Retained};
use objc2::runtime::{AnyClass, AnyObject, Bool};
use objc2::{MainThreadMarker, msg_send};
use objc2_app_kit::NSWorkspace;
use objc2_foundation::{NSBundle, NSString, NSURL};
use std::cell::OnceCell;

const LATEST_RELEASE: &str = "https://github.com/michaelshimeles/sketch/releases/latest";

thread_local! {
    /// The `SPUStandardUpdaterController`, kept for the life of the app; `None` without Sparkle.
    static CONTROLLER: OnceCell<Option<Retained<AnyObject>>> = const { OnceCell::new() };
}

/// Starts Sparkle, which checks the feed once a day and shows its update window when a newer
/// release is out. Main thread; later calls do nothing.
pub fn start() {
    with(|_| ());
}

/// Checks for updates now in Sparkle's window, or opens the latest release without Sparkle.
pub fn check_for_updates() {
    // SAFETY: `-[SPUStandardUpdaterController checkForUpdates:]` takes a nullable sender and
    // returns nothing.
    let checked = with(|controller| unsafe {
        let () = msg_send![controller, checkForUpdates: None::<&AnyObject>];
    });
    if checked.is_none()
        && let Some(url) = NSURL::URLWithString(&NSString::from_str(LATEST_RELEASE))
    {
        NSWorkspace::sharedWorkspace().openURL(&url);
    }
}

/// Runs `f` with the updater controller, loading Sparkle on first use. Main thread only.
fn with<R>(f: impl FnOnce(&AnyObject) -> R) -> Option<R> {
    MainThreadMarker::new()?;
    CONTROLLER.with(|c| c.get_or_init(load).as_deref().map(f))
}

fn load() -> Option<Retained<AnyObject>> {
    let frameworks = NSBundle::mainBundle().privateFrameworksPath()?;
    let path = NSString::from_str(&format!("{frameworks}/Sparkle.framework"));
    let bundle = NSBundle::bundleWithPath(&path)?;
    // SAFETY: the framework is sealed in this app's signature; loading it registers its classes.
    // The hardened runtime refuses it unless it is signed by the app's team.
    if !unsafe { bundle.load() } {
        return None;
    }
    let class = AnyClass::get(c"SPUStandardUpdaterController")?;
    // SAFETY: `initWithStartingUpdater:updaterDelegate:userDriverDelegate:` takes a BOOL and two
    // nullable delegates, and returns the initialised controller.
    unsafe {
        let controller: Allocated<AnyObject> = msg_send![class, alloc];
        msg_send![
            controller,
            initWithStartingUpdater: Bool::YES,
            updaterDelegate: None::<&AnyObject>,
            userDriverDelegate: None::<&AnyObject>
        ]
    }
}
