package ai.wsagent.android.ui

import androidx.compose.runtime.Composable
import ai.wsagent.android.MainViewModel
import ai.wsagent.android.ui.chat.ChatSheetContent

@Composable
fun ChatSheet(viewModel: MainViewModel) {
  ChatSheetContent(viewModel = viewModel)
}
