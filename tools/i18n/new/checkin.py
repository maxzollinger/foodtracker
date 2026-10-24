import json, os
K = ["About my weekly check-in: ", "Calories a day", "Goal {n}", "Highlights", "Tip for next week", "Weight this week", "Your coach is looking at your week…"]
V = {
"de": ["Zu meinem Wochen-Check-in: ", "Kalorien pro Tag", "Ziel {n}", "Highlights", "Tipp für nächste Woche", "Gewicht diese Woche", "Dein Coach schaut sich deine Woche an…"],
"es": ["Sobre mi resumen semanal: ", "Calorías al día", "Meta {n}", "Lo más destacado", "Consejo para la próxima semana", "Peso esta semana", "Tu coach está revisando tu semana…"],
"fr": ["À propos de mon bilan de la semaine : ", "Calories par jour", "Objectif {n}", "Points forts", "Conseil pour la semaine prochaine", "Poids cette semaine", "Ton coach regarde ta semaine…"],
"it": ["Sul mio check-in settimanale: ", "Calorie al giorno", "Obiettivo {n}", "In evidenza", "Consiglio per la prossima settimana", "Peso questa settimana", "Il tuo coach sta guardando la tua settimana…"],
"ja": ["週間チェックインについて：", "1日のカロリー", "目標 {n}", "ハイライト", "来週のヒント", "今週の体重", "コーチがあなたの1週間を確認しています…"],
"nl": ["Over mijn weekcheck-in: ", "Calorieën per dag", "Doel {n}", "Hoogtepunten", "Tip voor volgende week", "Gewicht deze week", "Je coach bekijkt je week…"],
"pl": ["O moim tygodniowym podsumowaniu: ", "Kalorie dziennie", "Cel {n}", "Najważniejsze", "Wskazówka na przyszły tydzień", "Waga w tym tygodniu", "Twój coach przegląda Twój tydzień…"],
"pt": ["Sobre o meu resumo semanal: ", "Calorias por dia", "Meta {n}", "Destaques", "Dica para a próxima semana", "Peso nesta semana", "Seu coach está olhando sua semana…"],
"ru": ["О моём недельном итоге: ", "Калорий в день", "Цель {n}", "Главное", "Совет на следующую неделю", "Вес за неделю", "Твой коуч смотрит на твою неделю…"],
"tr": ["Haftalık değerlendirmem hakkında: ", "Günlük kalori", "Hedef {n}", "Öne çıkanlar", "Gelecek hafta için ipucu", "Bu haftaki kilo", "Koçun haftana bakıyor…"],
"zh": ["关于我的每周总结：", "每日卡路里", "目标 {n}", "亮点", "下周小建议", "本周体重", "你的教练正在查看你的一周…"],
"ko": ["주간 체크인에 대해: ", "하루 칼로리", "목표 {n}", "하이라이트", "다음 주 팁", "이번 주 체중", "코치가 이번 주를 살펴보고 있어요…"],
"hi": ["मेरे साप्ताहिक चेक-इन के बारे में: ", "रोज़ की कैलोरी", "लक्ष्य {n}", "खास बातें", "अगले हफ़्ते के लिए टिप", "इस हफ़्ते का वज़न", "आपका कोच आपका हफ़्ता देख रहा है…"],
"id": ["Tentang check-in mingguanku: ", "Kalori per hari", "Target {n}", "Sorotan", "Tips untuk minggu depan", "Berat minggu ini", "Coach-mu sedang melihat minggumu…"],
"ar": ["بخصوص ملخصي الأسبوعي: ", "السعرات يوميًا", "الهدف {n}", "أبرز النقاط", "نصيحة للأسبوع القادم", "الوزن هذا الأسبوع", "مدربك يراجع أسبوعك…"],
}
json.dump({l: dict(zip(K, v)) for l, v in V.items()}, open(os.path.splitext(__file__)[0] + '.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('ok')
