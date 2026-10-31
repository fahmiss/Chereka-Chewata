import type { ReactNode } from 'react';
import { GimbarSessionProvider, GimbarSetupProvider } from './gimbar/context';
import { InsiderSessionProvider, InsiderSetupProvider } from './insider/context';
import { MesobSessionProvider, MesobSetupProvider } from './mesob/context';
import { MizanSessionProvider, MizanSetupProvider } from './mizan/context';
import { WinkKillerSessionProvider, WinkKillerSetupProvider } from './winkKiller/context';
import { EwnetSessionProvider, EwnetSetupProvider } from './ewnetWeysSaks/context';
import { ManNegnSessionProvider, ManNegnSetupProvider } from './manNegn/context';

/** Setup drafts and live sessions for Gimbar, Mesob, Mizan, Wink Killer and Insider. */
export function ExtraGameProviders({ children }: { children: ReactNode }) {
  return (
    <GimbarSetupProvider>
      <MesobSetupProvider>
        <MizanSetupProvider>
          <WinkKillerSetupProvider>
            <InsiderSetupProvider>
              <EwnetSetupProvider>
                <ManNegnSetupProvider>
                  <GimbarSessionProvider>
                    <MesobSessionProvider>
                      <MizanSessionProvider>
                        <WinkKillerSessionProvider>
                          <InsiderSessionProvider>
                            <EwnetSessionProvider>
                              <ManNegnSessionProvider>{children}</ManNegnSessionProvider>
                            </EwnetSessionProvider>
                          </InsiderSessionProvider>
                        </WinkKillerSessionProvider>
                      </MizanSessionProvider>
                    </MesobSessionProvider>
                  </GimbarSessionProvider>
                </ManNegnSetupProvider>
              </EwnetSetupProvider>
            </InsiderSetupProvider>
          </WinkKillerSetupProvider>
        </MizanSetupProvider>
      </MesobSetupProvider>
    </GimbarSetupProvider>
  );
}
