/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import LogicValidator from "./components/LogicValidator";
import { Toaster } from "@/components/ui/sonner";

export default function App() {
  return (
    <>
      <LogicValidator />
      <Toaster position="bottom-right" theme="dark" />
    </>
  );
}
