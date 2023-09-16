const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require("axios");

let servers = {
	main: {
		name: "メイン（研究鯖）",
		ip: "play.kairun.jp:19132",
		be: true
	},
	dhuaun: {
		name: "ﾃﾞｭｱｳﾝ鯖",
		ip: "play.kairun.jp:6000",
		be: true
	},
	tintin: {
		name: "でゅあでゅあでゅあ",
		ip: "play.kairun.jp:6001",
		be: true
	}
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName("status")
		.setDescription("サーバーの状態を確認します。")
		.addStringOption(option =>
			option
				.setName("server")
				.setDescription("サーバーを指定します。")
				.setRequired(true) //trueで必須、falseで任意
				.addChoices(...Object.entries(servers).map(([key, value]) => {
					return {
						name: value.name,
						value: key
					}
				}))
		),
	execute: async function (/** @type {import("discord.js").CommandInteraction} */ interaction) {
		const target = interaction.options.getString("server");
		await interaction.deferReply();
		try {
			let server = servers[target];
			if (server.ip) {
				let res = await axios.get("https://api.mcsrvstat.us/" + (server.be ? "bedrock/" : "") + "3/" + server.ip);
				if (res.data?.online) {
					let motd = res.data.motd.raw.join("\n")
						.replace(/\u00A70/g, "\x1B[30m")
						.replace(/\u00A71/g, "\x1B[34m")
						.replace(/\u00A72/g, "\x1B[32m")
						.replace(/\u00A73/g, "\x1B[36m")
						.replace(/\u00A74/g, "\x1B[31m")
						.replace(/\u00A75/g, "\x1B[35m")
						.replace(/\u00A76/g, "\x1B[33m")
						.replace(/\u00A77/g, "\x1B[37m")
						.replace(/\u00A78/g, "\x1B[90m")
						.replace(/\u00A79/g, "\x1B[94m")
						.replace(/\u00A7a/g, "\x1B[92m")
						.replace(/\u00A7b/g, "\x1B[96m")
						.replace(/\u00A7c/g, "\x1B[91m")
						.replace(/\u00A7d/g, "\x1B[95m")
						.replace(/\u00A7e/g, "\x1B[93m")
						.replace(/\u00A7f/g, "\x1B[97m")
						.replace(/\u00A7k/g, "\x1B[6m")
						.replace(/\u00A7l/g, "\x1B[1m")
						.replace(/\u00A7m/g, "\x1B[9m")
						.replace(/\u00A7n/g, "\x1B[4m")
						.replace(/\u00A7o/g, "\x1B[3m")
						.replace(/\u00A7r/g, "\x1B[0m");
					if (motd.length == 0)
						motd = "オンライン";
					await interaction.editReply({
						embeds: [{
							"title": `${server.name}は**オンライン**です!`,
							"description": "```ansi\n" + motd + "\n```",
							color: 0x42d4f5,
							fields: [{
								name: "人数",
								value: `${res.data.players.online} / ${res.data.players.max}`
							}, {
								name: "バージョン",
								value: res.data.version
							}],
							...(res.data.icon && {
								thumbnail: { url: "https://api.mcsrvstat.us/icon/" + server.ip }
							})
						}]
					});
				} else {
					await interaction.editReply(`${server.name}はオフラインです`);
				}
				return;
			}
			let res = await axios.get(server.url);
			if (res?.data?.status == "online") {
				await interaction.editReply(`${server.name}は ** オンライン ** です!`);
			} else {
				await interaction.editReply("接続に失敗しました!");
			}
		} catch (e) {
			if (e?.name == "AxiosError" && e?.response?.status) {
				await interaction.editReply({
					embeds: [{
						title: "エラー",
						description: `内部エラー: ${e.response.statusText}(${e.response.status})`,
						color: 0xff0000,
						footer: {
							text: "Teamkairun Discord.js Bot (by ringoXD)"
						}
					}]
				})
			} else {
				throw e;
			}
		}
	}
};