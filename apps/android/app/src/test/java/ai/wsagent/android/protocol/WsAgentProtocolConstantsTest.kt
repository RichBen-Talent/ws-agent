package ai.wsagent.android.protocol

import org.junit.Assert.assertEquals
import org.junit.Test

class WsAgentProtocolConstantsTest {
  @Test
  fun canvasCommandsUseStableStrings() {
    assertEquals("canvas.present", WsAgentCanvasCommand.Present.rawValue)
    assertEquals("canvas.hide", WsAgentCanvasCommand.Hide.rawValue)
    assertEquals("canvas.navigate", WsAgentCanvasCommand.Navigate.rawValue)
    assertEquals("canvas.eval", WsAgentCanvasCommand.Eval.rawValue)
    assertEquals("canvas.snapshot", WsAgentCanvasCommand.Snapshot.rawValue)
  }

  @Test
  fun a2uiCommandsUseStableStrings() {
    assertEquals("canvas.a2ui.push", WsAgentCanvasA2UICommand.Push.rawValue)
    assertEquals("canvas.a2ui.pushJSONL", WsAgentCanvasA2UICommand.PushJSONL.rawValue)
    assertEquals("canvas.a2ui.reset", WsAgentCanvasA2UICommand.Reset.rawValue)
  }

  @Test
  fun capabilitiesUseStableStrings() {
    assertEquals("canvas", WsAgentCapability.Canvas.rawValue)
    assertEquals("camera", WsAgentCapability.Camera.rawValue)
    assertEquals("screen", WsAgentCapability.Screen.rawValue)
    assertEquals("voiceWake", WsAgentCapability.VoiceWake.rawValue)
  }

  @Test
  fun screenCommandsUseStableStrings() {
    assertEquals("screen.record", WsAgentScreenCommand.Record.rawValue)
  }
}
